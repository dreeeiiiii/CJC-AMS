import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../db.js';
import type { AuthRequest } from '../middleware/auth.js';

// 📌 Get all users (Includes 'status' and 'profileImage')
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.member.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
        email: true,
        role: true,
        gender: true,
        contactNo: true,
        address: true,
        status: true,
        profileImage: true,
        joinDate: true,
        createdAt: true,
        _count: { select: { testimonies: true } },
      },
      orderBy: { createdAt: 'desc' }
    });

    // Compute attendance stats for all members in one pass
    const getSunday = (d: Date): number => {
      const date = new Date(d);
      date.setDate(date.getDate() - date.getDay());
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    };

    const allAttendance = await prisma.attendance.findMany({
      select: { memberId: true, createdAt: true },
      where: { memberId: { not: null } },
    });

    const memberDates: Record<number, Date[]> = {};
    for (const rec of allAttendance) {
      const mid = rec.memberId!;
      if (!memberDates[mid]) memberDates[mid] = [];
      memberDates[mid].push(rec.createdAt);
    }

    const computeStreak = (dates: Date[]): number => {
      const weekSet = new Set<number>();
      for (const d of dates) weekSet.add(getSunday(d));
      const sorted = Array.from(weekSet).sort((a, b) => a - b);
      if (sorted.length === 0) return 0;
      let maxStreak = 1;
      let current = 1;
      for (let i = 1; i < sorted.length; i++) {
        const diff = (sorted[i]! - sorted[i - 1]!) / (1000 * 60 * 60 * 24);
        if (diff === 7) { current++; maxStreak = Math.max(maxStreak, current); }
        else { current = 1; }
      }
      return maxStreak;
    };

    const streakCache: Record<number, number> = {};
    for (const mid of Object.keys(memberDates)) {
      streakCache[Number(mid)] = computeStreak(memberDates[Number(mid)]!);
    }

    const enriched = users.map(u => ({
      ...u,
      testimonyCount: u._count?.testimonies ?? 0,
      totalAttendance: memberDates[u.id]?.length ?? 0,
      streak: streakCache[u.id] ?? 0,
      _count: undefined,
    }));
    res.status(200).json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Get user by ID
export const getUsersById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.member.findUnique({
      where: { id: Number(id) },
      include: { _count: { select: { testimonies: true } } },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const getSunday = (d: Date): number => {
      const date = new Date(d);
      date.setDate(date.getDate() - date.getDay());
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    };

    const attendanceRecords = await prisma.attendance.findMany({
      where: { memberId: user.id },
      select: { createdAt: true },
    });

    const weekSet = new Set<number>();
    for (const rec of attendanceRecords) weekSet.add(getSunday(rec.createdAt));
    const sorted = Array.from(weekSet).sort((a, b) => a - b);
    let streak = 0;
    if (sorted.length > 0) {
      streak = 1;
      let current = 1;
      for (let i = 1; i < sorted.length; i++) {
        const diff = (sorted[i]! - sorted[i - 1]!) / (1000 * 60 * 60 * 24);
        if (diff === 7) { current++; streak = Math.max(streak, current); }
        else { current = 1; }
      }
    }

    const { _count, ...rest } = user;
    res.status(200).json({
      ...rest,
      testimonyCount: _count?.testimonies ?? 0,
      totalAttendance: attendanceRecords.length,
      streak,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Create new user (Admin Member + Signup Auth Flow)
export const createUsers = async (req: Request, res: Response) => {
  const {
    firstName,
    lastName,
    middleInitial,
    middleName,
    email,
    password,
    contactNo,
    address,
    gender,
    role,
    status,
    profileImage,
    mode
  } = req.body;

  try {
    console.log('mode', mode)
    // Validate required profile fields
    if (!firstName || !lastName || !gender ||!email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // -----------------------------
    // 🟦 ADMIN MODE (PROFILE ONLY)
    // -----------------------------
      
    if (mode === "admin") {
      const memberDefaultPwd = await bcrypt.hash('newmember', 10);
      const newMember = await prisma.member.create({
        data: {
          firstName,
          lastName,
          email,
          password: memberDefaultPwd,
          middleName: middleName || null,
          contactNo: contactNo || "",
          address: address || "",
          gender,
          status: status || "New Member",
          profileImage: profileImage || null,
          joinDate: new Date(),
        },
      });

      // TODO
      // send email to user "account created with password"
      // sample implementation
      // https://gemini.google.com/app/7a693ce7f054e278

      

      return res.status(201).json(newMember);
    }

    // -----------------------------
    // 🟩 SIGNUP MODE (AUTH + PROFILE)
    // -----------------------------
    if (mode === "signup") {
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const existingAccount = await prisma.userAccount.findUnique({
        where: { email },
      });

      if (existingAccount) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      
      const newMember = await prisma.member.create({
        data: {
          firstName,
          lastName,
          password: hashedPassword,
          email,
          middleName: middleName || null,
          contactNo: contactNo || "",
          address: address || "",
          gender,
          status: status || "New Member",
          joinDate: new Date(),
        }
      });

      return res.status(201).json(newMember);
    }

    return res.status(400).json({ message: "Invalid mode" });

  } catch (error: any) {
    console.error("CREATE USER ERROR:", error);
    if (error.code === 'P2002') {
      return res.status(409).json({ message: "Email is already in use" });
    }
    return res.status(500).json({ error: error.message });
  }
};


// 📌 Update user (Admin Dashboard endpoint)
export const updateUsers = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { firstName, lastName, middleName, email, contactNo, address, gender, role, password, status, profileImage, joinDate } = req.body;

  try {
    const updateData: any = {
      firstName,
      lastName,
      middleName,
      email,
      contactNo,
      address,
      gender,
      role,
      status,
      profileImage,
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (joinDate !== undefined && joinDate !== '') {
      const current = await prisma.member.findUnique({
        where: { id: Number(id) },
        select: { joinDate: true },
      });

      const newJoinDate = new Date(joinDate);
      const oldJoinDate = current?.joinDate;

      const datesDiffer = !oldJoinDate ||
        oldJoinDate.getFullYear() !== newJoinDate.getFullYear() ||
        oldJoinDate.getMonth() !== newJoinDate.getMonth() ||
        oldJoinDate.getDate() !== newJoinDate.getDate();

      if (datesDiffer) {
        updateData.joinDate = newJoinDate;
        const currentYear = new Date().getFullYear();
        updateData.status = newJoinDate.getFullYear() >= currentYear ? "New Member" : "Old Member";
      }
    }

    const updatedUser = await prisma.member.update({
      where: { id: Number(id) },
      data: updateData,
    });

    res.status(200).json(updatedUser);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ error: error.message });
  }
};

// 📌 Delete user
export const deleteUsers = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.member.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ error: error.message });
  }
};

// 📌 Get authenticated user's own profile
export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = (req.user as any).id;
    const user = await prisma.member.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Update authenticated user's own profile text information 
export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = (req.user as any).id;
    const { firstName, middleName, lastName, email, contactNo, address, gender, group, joinDate } = req.body;

    const updateData: any = {
      firstName,
      middleName,
      lastName,
      email,
      contactNo,
      address,
      gender,
      group,
    };

    if (joinDate !== undefined && joinDate !== '') {
      const current = await prisma.member.findUnique({
        where: { id: userId },
        select: { joinDate: true },
      });

      const newJoinDate = new Date(joinDate);
      const oldJoinDate = current?.joinDate;

      const datesDiffer = !oldJoinDate ||
        oldJoinDate.getFullYear() !== newJoinDate.getFullYear() ||
        oldJoinDate.getMonth() !== newJoinDate.getMonth() ||
        oldJoinDate.getDate() !== newJoinDate.getDate();

      if (datesDiffer) {
        updateData.joinDate = newJoinDate;
        const currentYear = new Date().getFullYear();
        updateData.status = newJoinDate.getFullYear() >= currentYear ? "New Member" : "Old Member";
      }
    }

    const updatedUser = await prisma.member.update({
      where: { id: userId },
      data: updateData,
    });

    res.status(200).json(updatedUser);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ error: error.message });
  }
};

// 📌 NEW: Save Profile Upload image metadata explicitly to the database
// Connect this function directly to your `POST /api/upload-profile` route path!
export const uploadProfileImageController = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = (req.user as any).id;

    // Assuming you are handling the file saving via a middleware engine like multer,
    // and passing the public path URL layout payload here:
    const { profileImage } = req.body; 

    if (!profileImage) {
      return res.status(400).json({ message: "Profile image URL metadata path missing" });
    }

    const updatedUser = await prisma.member.update({
      where: { id: userId },
      data: {
        profileImage: profileImage,
      },
    });

    res.status(200).json({ 
      message: "Image synced to database successfully", 
      imageUrl: updatedUser.profileImage 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Change password for authenticated user
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = (req.user as any).id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await prisma.member.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.member.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// 📌 Search members
export const searchMembers = async (req: Request, res: Response) => {
  const { q } = req.query;
  if (!q) return res.json([]);

  try {
    const members = await prisma.member.findMany({
      where: {
        OR: [
          { firstName: { contains: String(q), mode: 'insensitive' } },
          { lastName: { contains: String(q), mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
        status: true,
      },
      take: 8,
    });
    res.json(members);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};