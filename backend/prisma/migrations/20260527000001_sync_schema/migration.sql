-- Sync migration: brings database from old initial schema to current schema
-- Database was already updated via prisma db push; this migration
-- records those changes for the migration history.

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "Role" AS ENUM ('MEMBER', 'ADMIN', 'VISITOR');
CREATE TYPE "Group" AS ENUM ('General', 'Kids', 'Campus', 'YA', 'Mommies', 'Daddies');

-- AlterTable: Member (migrate from fullName to firstName/lastName/middleName, add new columns)
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "lastName" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "middleName" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "role" "Role" NOT NULL DEFAULT 'MEMBER';
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'New Member';
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "accountStatus" TEXT NOT NULL DEFAULT 'Active';
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "group" "Group" NOT NULL DEFAULT 'General';
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "profileImage" TEXT;

-- Split fullName into firstName and lastName if fullName still exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Member' AND column_name='fullName') THEN
    UPDATE "Member" SET "firstName" = SPLIT_PART("fullName", ' ', 1), "lastName" = SUBSTRING("fullName" FROM POSITION(' ' IN "fullName") + 1);
    ALTER TABLE "Member" DROP COLUMN "fullName";
  END IF;
END $$;

-- Make firstName and lastName NOT NULL after data migration
ALTER TABLE "Member" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "lastName" SET NOT NULL;

-- CreateTable: UserAccount
CREATE TABLE IF NOT EXISTS "UserAccount" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "memberId" INTEGER NOT NULL,
    CONSTRAINT "UserAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Verse
CREATE TABLE IF NOT EXISTS "Verse" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "topic" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Verse_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Testimony
CREATE TABLE IF NOT EXISTS "Testimony" (
    "id" SERIAL NOT NULL,
    "quote" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "memberId" INTEGER,
    "name" TEXT,
    "avatar" TEXT,
    CONSTRAINT "Testimony_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Attendance
CREATE TABLE IF NOT EXISTS "Attendance" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER,
    "visitorId" INTEGER,
    "recordedBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PasswordReset
CREATE TABLE IF NOT EXISTS "PasswordReset" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- AlterTable: Visitor (add new columns)
ALTER TABLE "Visitor" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE "Visitor" ADD COLUMN IF NOT EXISTS "lastName" TEXT;
ALTER TABLE "Visitor" ADD COLUMN IF NOT EXISTS "middleName" TEXT;
ALTER TABLE "Visitor" ADD COLUMN IF NOT EXISTS "churchAffiliation" TEXT;
ALTER TABLE "Visitor" ADD COLUMN IF NOT EXISTS "invitedBy" TEXT;
ALTER TABLE "Visitor" ADD COLUMN IF NOT EXISTS "purposeOfVisit" TEXT;
ALTER TABLE "Visitor" ADD COLUMN IF NOT EXISTS "role" "Role" NOT NULL DEFAULT 'VISITOR';

-- Split fullName into firstName and lastName for visitor if fullName still exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Visitor' AND column_name='fullName') THEN
    UPDATE "Visitor" SET "firstName" = SPLIT_PART("fullName", ' ', 1), "lastName" = SUBSTRING("fullName" FROM POSITION(' ' IN "fullName") + 1);
    ALTER TABLE "Visitor" DROP COLUMN "fullName";
  END IF;
END $$;

ALTER TABLE "Visitor" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "Visitor" ALTER COLUMN "lastName" SET NOT NULL;

-- AlterTable: Announcement (add new columns, rename message->content if needed)
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "content" TEXT;
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "image" TEXT;
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "timestamp" TEXT;
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'General';
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "author" TEXT NOT NULL DEFAULT 'CJCRSG Phils. Inc.';
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "link" TEXT;
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "pinned" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "scheduledAt" TIMESTAMP(3);
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "acknowledgmentCount" INTEGER NOT NULL DEFAULT 0;

-- Copy message to content if message exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Announcement' AND column_name='message') THEN
    UPDATE "Announcement" SET "content" = "message" WHERE "content" IS NULL;
    ALTER TABLE "Announcement" DROP COLUMN "message";
  END IF;
END $$;

ALTER TABLE "Announcement" ALTER COLUMN "content" SET NOT NULL;
ALTER TABLE "Announcement" ALTER COLUMN "timestamp" SET NOT NULL;
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "title" TEXT;
UPDATE "Announcement" SET "title" = '' WHERE "title" IS NULL;
ALTER TABLE "Announcement" ALTER COLUMN "title" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "UserAccount_email_key" ON "UserAccount"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "UserAccount_memberId_key" ON "UserAccount"("memberId");

-- AddForeignKey
ALTER TABLE "UserAccount" ADD CONSTRAINT "UserAccount_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Testimony" ADD CONSTRAINT "Testimony_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop the old unique index on Visitor.email that used the old name
DROP INDEX IF EXISTS "Visitor_email_key";
