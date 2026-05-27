import type { Request, Response } from "express";
import prisma from "../db.js";
import { startOfWeek } from "date-fns";
import { updateMemberAccountStatus } from "../utils/updateAccountStatus.js";

interface AuthRequest extends Request {
    user?: {
        id: number;
        role: string;
    };
}

/**
 * POST /api/attendance
 */
export const recordAttendance = async (req: AuthRequest, res: Response) => {
    const { memberId, visitorId } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
        return res.status(401).json({ message: "Unauthorized: Admin ID missing" });
    }
    if (memberId) {
        await updateMemberAccountStatus(Number(memberId));
    }

    try {
        if (!memberId && !visitorId) {
            return res.status(400).json({ message: "Member or Visitor ID required" });
        }

        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);

        const lookupQuery: any = {
            createdAt: { gte: todayStart }
        };

        if (memberId) {
            lookupQuery.memberId = Number(memberId);
        } else {
            lookupQuery.visitorId = Number(visitorId);
        }

        const existing = await prisma.attendance.findFirst({
            where: lookupQuery
        });

        if (existing) {
            return res.status(400).json({ message: "Attendance already recorded for today" });
        }

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
 */
export const getRecentActivity = async (req: Request, res: Response) => {
    try {
        const activity = await prisma.attendance.findMany({
            take: 10,
            orderBy: { createdAt: "desc" },
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
            const firstName =
                record.member?.firstName ||
                record.visitor?.firstName ||
                "Unknown";

            const lastName =
                record.member?.lastName ||
                record.visitor?.lastName ||
                "User";

            let displayStatus =
                record.member?.status ||
                (record.visitor ? "Visitor" : "Unknown");

            if (record.member && !record.member.status) {
                const isNew =
                    new Date().getTime() -
                        new Date(record.member.createdAt).getTime() <
                    7 * 24 * 60 * 60 * 1000;

                displayStatus = isNew ? "New Member" : "Old Member";
            }

            return {
                id: record.id,
                name: `${firstName} ${lastName}`,
                status: displayStatus,
                date: record.createdAt.toISOString().split("T")[0],
                time: record.createdAt.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
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

        const weeklyAttendance = await prisma.attendance.findMany({
            where: { createdAt: { gte: weekStart } },
            include: { member: true }
        });

        const newAttendeesCount = weeklyAttendance.filter(
            a => a.member?.status === "New Member"
        ).length;

        const oldAttendeesCount = weeklyAttendance.filter(
            a => a.member?.status === "Old Member"
        ).length;

        const categorizedTotal =
            newAttendeesCount + oldAttendeesCount;

        res.json({
            newAttendeesWeek: newAttendeesCount,
            totalAttendeesWeek: weeklyAttendance.length,
            ratio: {
                old: oldAttendeesCount,
                new: newAttendeesCount,
                oldPercentage:
                    categorizedTotal > 0
                        ? Math.round(
                              (oldAttendeesCount / categorizedTotal) *
                                  100
                          )
                        : 0,
                newPercentage:
                    categorizedTotal > 0
                        ? Math.round(
                              (newAttendeesCount / categorizedTotal) *
                                  100
                          )
                        : 0
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * GET /api/attendance
 */
export const getAllAttendance = async (req: Request, res: Response) => {
    try {
        const records = await prisma.attendance.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                member: {
                    select: {
                        firstName: true,
                        lastName: true,
                        group: true,
                        createdAt: true
                    }
                },
                visitor: {
                    select: {
                        firstName: true,
                        lastName: true,
                        category: true
                    }
                }
            }
        });

        const formatted = records.map(record => {
            const firstName =
                record.member?.firstName ||
                record.visitor?.firstName ||
                "Unknown";

            const lastName =
                record.member?.lastName ||
                record.visitor?.lastName ||
                "User";

            let group = "General";

            if (record.member?.group) {
                group = record.member.group;
            } else if (record.visitor) {
                group = "Visitor";
            }

            return {
                id: record.id,
                name: `${firstName} ${lastName}`,
                group,
                date: record.createdAt.toISOString().split("T")[0],
                time: record.createdAt.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
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
 * DELETE /api/attendance/:id
 */
export const deleteAttendance = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const id = Number(req.params.id);

        const existing = await prisma.attendance.findUnique({
            where: { id }
        });

        if (!existing) {
            return res
                .status(404)
                .json({ message: "Attendance record not found" });
        }

        await prisma.attendance.delete({ where: { id } });

        res.json({
            message: "Attendance record deleted successfully"
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * GET /api/attendance/export
 */
export const exportAttendance = async (
    req: Request,
    res: Response
) => {
    try {
        const records = await prisma.attendance.findMany({
            include: { member: true, visitor: true },
            orderBy: { createdAt: "desc" }
        });

        let csv = "Date,Time,Name,Email,Type\n";

        records.forEach(r => {
            const date = r.createdAt.toISOString().split("T")[0];
            const time = r.createdAt.toLocaleTimeString("en-US", {
                hour12: false
            });

            const name = r.member
                ? `${r.member.firstName} ${r.member.lastName}`
                : `${r.visitor?.firstName} ${r.visitor?.lastName}`;

            const email = r.member?.email || r.visitor?.email || "N/A";
            const type = r.member ? "Member" : "Visitor";

            csv += `${date},${time},"${name}",${email},${type}\n`;
        });

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=attendance_report.csv"
        );

        res.status(200).send(csv);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * GET /api/attendance/summary
 * FIXED Sunday-based logic
 */
export const getAttendanceSummary = async (
    req: Request,
    res: Response
) => {
    try {
        // IMPORTANT: You should filter by the specific logged-in user's ID.
        // const memberId = (req as AuthRequest).user?.id;
        
        const records = await prisma.attendance.findMany({
            // where: { memberId: memberId }, 
            orderBy: { createdAt: "asc" }
        });

        const attendanceMap: Record<string, boolean> = {};
        const uniqueWeeks = new Set<number>();

        // Helper to map any date to its corresponding Sunday
        const getSunday = (date: Date): Date => {
            const d = new Date(date);
            d.setDate(d.getDate() - d.getDay()); 
            return d;
        };

        for (const r of records) {
            const sundayDate = getSunday(r.createdAt);

            // Format as YYYY-MM-DD
            const year = sundayDate.getFullYear();
            const month = String(sundayDate.getMonth() + 1).padStart(2, "0");
            const day = String(sundayDate.getDate()).padStart(2, "0");
            
            const key = `${year}-${month}-${day}`;
            attendanceMap[key] = true; 

            // Track weeks for streak calculation
            sundayDate.setHours(0, 0, 0, 0);
            uniqueWeeks.add(sundayDate.getTime());
        }

        // Streak Calculation
        const sortedWeeks = Array.from(uniqueWeeks).sort((a, b) => a - b);
        let maxStreak = 0;
        let currentStreak = 1;

        if (sortedWeeks.length > 0) {
            maxStreak = 1;
            for (let i = 1; i < sortedWeeks.length; i++) {
                // FIX: Extract variables and use '!' to satisfy strict TypeScript
                const currentWeek = sortedWeeks[i]!;
                const previousWeek = sortedWeeks[i - 1]!;

                // Check if the difference between weeks is exactly 7 days
                const diffDays = (currentWeek - previousWeek) / (1000 * 60 * 60 * 24);
                
                if (diffDays === 7) {
                    currentStreak++;
                    maxStreak = Math.max(maxStreak, currentStreak);
                } else {
                    currentStreak = 1;
                }
            }
        }

        return res.json({
            attendance: attendanceMap,
            streak: maxStreak
        });

    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};