import type { Request, Response } from 'express';
// 1. Import your existing configured prisma instance
import prisma from '../db.js'; 
// 2. Import only the Enums and Types from the client
import { Category } from '@prisma/client';

interface CreateVisitorDTO {
  fullName: string;
  originalChurch: string;
  invitedBy?: string;
  contactNo?: string;
  address?: string;
  dateOfVisit?: string; 
  purposeOfVisit?: string; // Optional field for future use
}

/**
 * 📌 Get all visitors
 */
export const getAllVisitors = async (req: Request, res: Response) => {
  try {
    const visitors = await prisma.visitor.findMany({
      orderBy: { visitedAt: 'desc' },
    });
    res.status(200).json(visitors);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching visitors", error: error.message });
  }
};

/**
 * 📌 Create a new visitor
 */
export const createVisitor = async (req: Request<{}, {}, CreateVisitorDTO>, res: Response) => {
  try {
    const { 
      fullName, 
      originalChurch, 
      invitedBy,
      contactNo, 
      address,
      dateOfVisit, 
      purposeOfVisit 
    } = req.body;

    const nameParts = (fullName || "").trim().split(' ');
    const firstName: string = nameParts[0] || "Guest"; 
    const lastName: string = nameParts.length > 1 ? nameParts.slice(1).join(' ') : "Visitor";

    const newVisitor = await prisma.visitor.create({
      data: {
        firstName,
        lastName,
        churchAffiliation: originalChurch,
        invitedBy: invitedBy || null,
        contactNo: contactNo || null,
        address: address || null,
        category: invitedBy ? Category.Invited : Category.WalkIn,
        visitedAt: dateOfVisit ? new Date(dateOfVisit + 'T00:00:00Z') : new Date(),
        purposeOfVisit: purposeOfVisit || null,
      },
    });

    res.status(201).json(newVisitor);
  } catch (error: any) {
    res.status(500).json({ message: "Error saving visitor", error: error.message });
  }
};

/**
 * 📌 Update a visitor
 */
export const updateVisitor = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      originalChurch,
      invitedBy,
      contactNo,
      address,
      dateOfVisit,
      purposeOfVisit,
    } = req.body;

    const nameParts = (fullName || "").trim().split(' ');
    const firstName: string = nameParts[0] || "Guest";
    const lastName: string = nameParts.length > 1 ? nameParts.slice(1).join(' ') : "Visitor";

    const updated = await prisma.visitor.update({
      where: { id: Number(id) },
      data: {
        firstName,
        lastName,
        churchAffiliation: originalChurch || null,
        invitedBy: invitedBy || null,
        contactNo: contactNo || null,
        address: address || null,
        category: invitedBy ? Category.Invited : Category.WalkIn,
        purposeOfVisit: purposeOfVisit ?? null,
      ...(dateOfVisit && { visitedAt: new Date(dateOfVisit + 'T00:00:00Z') }),
      },
    });

    res.status(200).json(updated);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Visitor not found" });
    }
    res.status(500).json({ message: "Error updating visitor", error: error.message });
  }
};

/**
 * 📌 Bulk Delete Visitors
 */
export const deleteVisitors = async (req: Request, res: Response) => {
  const { ids }: { ids: number[] } = req.body;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: "Invalid IDs provided" });
  }

  try {
    const deleted = await prisma.visitor.deleteMany({
      where: {
        id: { in: ids.map(id => Number(id)) }
      }
    });
    res.status(200).json({ message: `${deleted.count} visitors deleted` });
  } catch (error: any) {
    res.status(500).json({ message: "Bulk delete failed", error: error.message });
  }
};

/**
 * 📌 Get Dashboard Stats
 * Optimized to ensure date boundaries start at midnight
 */
export const getVisitorStats = async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const weekStart = new Date(Date.UTC(
      now.getUTCFullYear(), 
      now.getUTCMonth(), 
      now.getUTCDate() - now.getUTCDay()  // Sunday = 0
    ));

    const monthStart = new Date(Date.UTC(
      now.getUTCFullYear(), 
      now.getUTCMonth(), 
      1
    ));

    const [total, week, month] = await Promise.all([
      prisma.visitor.count(),
      prisma.visitor.count({ 
        where: { visitedAt: { gte: weekStart } } 
      }),
      prisma.visitor.count({ 
        where: { visitedAt: { gte: monthStart } } 
      }),
    ]);

    res.status(200).json({ total, week, month });
  } catch (error: any) {
    res.status(500).json({ message: "Error generating stats", error: error.message });
  }
};