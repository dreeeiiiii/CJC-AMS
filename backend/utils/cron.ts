// src/utils/cron.ts
import cron from 'node-cron';
import prisma from '../db.js'; // Adjust this path to match your actual db.js location

export const initCronJobs = () => {
  // 📌 Runs every single day at midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ [Cron Job] Running daily 2-month inactivity check...');

    try {
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

      // Find members who are currently 'Active' but have zero attendance records in the last 2 months
      const inactiveMembers = await prisma.member.findMany({
        where: {
          accountStatus: 'Active',
          joinDate: { lt: twoMonthsAgo }, // Safety check: ensures we don't flag brand-new signups
          attendance: {
            none: {
              createdAt: {
                gte: twoMonthsAgo,
              },
            },
          },
        },
        select: { id: true }
      });

      if (inactiveMembers.length > 0) {
        const idsToUpdate = inactiveMembers.map(m => m.id);
        
        await prisma.member.updateMany({
          where: { id: { in: idsToUpdate } },
          data: { accountStatus: 'Inactive' },
        });
        
        console.log(`✅ [Cron Job] Successfully marked ${idsToUpdate.length} members as Inactive.`);
      } else {
        console.log('ℹ️ [Cron Job] No inactive accounts found to update today.');
      }
    } catch (error) {
      console.error('❌ [Cron Job Error] Failed to process inactivity update:', error);
    }
  });
};