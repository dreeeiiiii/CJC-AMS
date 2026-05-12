import type { Request, Response } from "express";
import prisma from "../db.js";
import { startOfWeek, startOfMonth } from 'date-fns';

interface AuthRequest extends Request {
    user?: {
        id: number;
        role: string;
    };
}

/**
 * POST /api/attendance
 * Records a new attendance entry
 */
export const recordAttendance = async (req: AuthRequest, res: Response) => {
    const { memberId, visitorId } = req.body; // Support both
    const adminId = req.user?.id;

    if (!adminId) {
        return res.status(401).json({ message: "Unauthorized: Admin ID missing" });
    }

    try {
        // 1. Validation: Ensure at least one ID is provided
        if (!memberId && !visitorId) {
            return res.status(400).json({ message: "Member or Visitor ID required" });
        }

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // 2. Check for duplicate attendance today
        const existing = await prisma.attendance.findFirst({
            where: {
                memberId: memberId ? Number(memberId) : null,
                visitorId: visitorId ? Number(visitorId) : null,
                createdAt: { gte: todayStart }
            }
        });

        if (existing) {
            return res.status(400).json({ message: "Attendance already recorded for today" });
        }

        // 3. Create Record
        const record = await prisma.attendance.create({
            data: {
                memberId: memberId ? Number(memberId) : null,
                visitorId: visitorId ? Number(visitorId) : null,
                recordedBy: adminId
            },
            include: { 
                member: true,
                visitor: true 
            }
        });

        res.status(201).json(record);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * GET /api/attendance/recent
 * Powers the "Recent Activity" Table - FIXED to prevent frontend crashes
 */
export const getRecentActivity = async (req: Request, res: Response) => {
    try {
        const activity = await prisma.attendance.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                member: {
                    select: {
                        firstName: true,
                        lastName: true,
                        status: true, // This is what you set in the other page
                        createdAt: true
                    }
                },
                visitor: true
            }
        });

        const formatted = activity.map(record => {
            const firstName = record.member?.firstName || record.visitor?.firstName || "Unknown";
            const lastName = record.member?.lastName || record.visitor?.lastName || "User";
            
            // ✅ FIX: Use the status from the database first
            let displayStatus = record.member?.status || (record.visitor ? "Visitor" : "Unknown");
            
            // Optional: Only calculate if status is null/empty
            if (record.member && !record.member.status) {
                const isNew = (new Date().getTime() - new Date(record.member.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;
                displayStatus = isNew ? 'New Member' : 'Old Member';
            }

            return {
                id: record.id,
                name: `${firstName} ${lastName}`,
                status: displayStatus,
                date: record.createdAt.toISOString().split('T')[0],
                time: record.createdAt.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    hour12: true 
                })
            };
        });

        res.json(formatted);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
/**
 * GET /api/attendance/stats
 */
export const getAttendanceStats = async (req: Request, res: Response) => {
    try {
        const now = new Date();
        const weekStart = startOfWeek(now);

        // Get all weekly attendance
        const weeklyAttendance = await prisma.attendance.findMany({
            where: { createdAt: { gte: weekStart } },
            include: { member: true }
        });

        // ✅ Count based on the 'status' field in the Member table
        const newAttendeesCount = weeklyAttendance.filter(a => a.member?.status === 'New Member').length;
        const oldAttendeesCount = weeklyAttendance.filter(a => a.member?.status === 'Old Member').length;
        const totalWeekly = weeklyAttendance.length;

        res.json({
            newAttendeesWeek: newAttendeesCount,
            totalAttendeesWeek: totalWeekly,
            ratio: {
                old: oldAttendeesCount,
                new: newAttendeesCount,
                oldPercentage: totalWeekly > 0 ? Math.round((oldAttendeesCount / totalWeekly) * 100) : 0,
                newPercentage: totalWeekly > 0 ? Math.round((newAttendeesCount / totalWeekly) * 100) : 0
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * GET /api/attendance/export
 */
export const exportAttendance = async (req: Request, res: Response) => {
    try {
        const records = await prisma.attendance.findMany({
            include: {
                member: true,
                visitor: true
            },
            orderBy: { createdAt: 'desc' }
        });

        let csv = "Date,Time,Name,Email,Type\n";

        records.forEach(r => {
            const date = r.createdAt.toISOString().split('T')[0];
            const time = r.createdAt.toLocaleTimeString('en-US', { hour12: false });
            const name = r.member ? `${r.member.firstName} ${r.member.lastName}` : `${r.visitor?.firstName} ${r.visitor?.lastName}`;
            const email = r.member?.email || r.visitor?.email || "N/A";
            const type = r.member ? "Member" : "Visitor";
            
            csv += `${date},${time},"${name}",${email},${type}\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.csv');
        res.status(200).send(csv);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};