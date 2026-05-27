import prisma from "../db.js";
import { AccountStatus } from "@prisma/client";

export const updateMemberAccountStatus = async (memberId: number) => {
    try {
      // 1. Instantly flip the status to ACTIVE since they are checking in right now
      const accountStatus = AccountStatus.ACTIVE;
  
      // 2. Safely update using updateMany to prevent crashes if the userAccount profile doesn't exist yet
      await prisma.userAccount.updateMany({
        where: {
          memberId: memberId,
        },
        data: {
          accountStatus: accountStatus,
        },
      });
    } catch (error: any) {
      console.error(`Failed to update account status for member ID ${memberId}:`, error.message);
    }
  };