import type { Request, Response } from "express";
import prisma from "../db.js";
import { startOfWeek } from 'date-fns';

interface AuthRequest extends Request {
    user?: {
        id: number;
        role: string;
    };
}

/**
 * POST /api/attendance
 * Records a new attendance entry with resilient duplicate checks
 */
export const recordAttendance = async (req: AuthRequest, res: Response) => {
    const { memberId, visitorId } = req.body; 
    const adminId = req.user?.id;

    if (!adminId) {
        return res.status(401).json({ message: "Unauthorized: Admin ID missing" });
    }

    try {
        // 1. Validation: Ensure exactly one valid reference id is extracted
        if (!memberId && !visitorId) {
            return res.status(400).json({ message: "Member or Visitor ID required" });
        }

        // 2. Exact UTC Midnight Boundary Check
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);

        // 3. Dynamic Conditional Payload construction to prevent Prisma null-clashing
        const lookupQuery: any = {
            createdAt: { gte: todayStart }
        };

        if (memberId) {
            lookupQuery.memberId = Number(memberId);
        } else if (visitorId) {
            lookupQuery.visitorId = Number(visitorId);
        }

        // Check for duplicate attendance today
        const existing = await prisma.attendance.findFirst({
            where: lookupQuery
        });

        if (existing) {
            return res.status(400).json({ message: "Attendance already recorded for today" });
        }

        // 4. Create Record using explicit 'null' instead of 'undefined' 
        // to comply with exactOptionalPropertyTypes compilation targets
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
 * Powers the "Recent Activity" Table
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
                        status: true,
                        createdAt: true
                    }
                },
                visitor: true
            }
        });

        const formatted = activity.map(record => {
            const firstName = record.member?.firstName || record.visitor?.firstName || "Unknown";
            const lastName = record.member?.lastName || record.visitor?.lastName || "User";
            
            let displayStatus = record.member?.status || (record.visitor ? "Visitor" : "Unknown");
            
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
 * Fixes broken percentage calculations due to unhandled entity types
 */
export const getAttendanceStats = async (req: Request, res: Response) => {
    try {
        const now = new Date();
        const weekStart = startOfWeek(now);

        const weeklyAttendance = await prisma.attendance.findMany({
            where: { createdAt: { gte: weekStart } },
            include: { member: true }
        });

        const newAttendeesCount = weeklyAttendance.filter(a => a.member?.status === 'New Member').length;
        const oldAttendeesCount = weeklyAttendance.filter(a => a.member?.status === 'Old Member').length;
        
        // Count only categorized accounts to guarantee math aggregates perfectly to 100%
        const categorizedTotal = newAttendeesCount + oldAttendeesCount;

        res.json({
            newAttendeesWeek: newAttendeesCount,
            totalAttendeesWeek: weeklyAttendance.length, // Total count keeps rendering overall activity
            ratio: {
                old: oldAttendeesCount,
                new: newAttendeesCount,
                oldPercentage: categorizedTotal > 0 ? Math.round((oldAttendeesCount / categorizedTotal) * 100) : 0,
                newPercentage: categorizedTotal > 0 ? Math.round((newAttendeesCount / categorizedTotal) * 100) : 0
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