import type { Request, Response } from 'express';
import prisma from '../db.js';

/**
 * --- VERSE CONTROLLERS ---
 */

// @desc    Get the current active Verse of the Day
// @route   GET /api/content/verse/today
export const getActiveVerse = async (req: Request, res: Response) => {
  try {
    // We look for the most recently updated 'active' verse
    const verse = await prisma.verse.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
    });

    if (!verse) {
      return res.status(404).json({ message: "No active verse found" });
    }

    res.status(200).json(verse);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// @desc    Create a new Verse (and set as active)
// @route   POST /api/content/verse
export const createVerse = async (req: Request, res: Response) => {
  const { content, reference, topic } = req.body;

  if (!content || !reference) {
    return res.status(400).json({ message: "Content and reference are required" });
  }

  try {
    // 1. Transaction: Deactivate others and create new one to ensure data integrity
    const result = await prisma.$transaction(async (tx) => {
      await tx.verse.updateMany({
        data: { isActive: false },
      });

      return await tx.verse.create({
        data: {
          content,
          reference,
          topic: topic || null,
          isActive: true,
        },
      });
    });

    res.status(201).json({ message: "Verse created and published", result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * --- TESTIMONY CONTROLLERS ---
 */

// @desc    Get all testimonies
// @route   GET /api/content/testimonies
export const getTestimonies = async (req: Request, res: Response) => {
  try {
    const testimonies = await prisma.testimony.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(testimonies);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create a new testimony
// @route   POST /api/content/testimonies
export const createTestimony = async (req: Request, res: Response) => {
  const { name, quote, avatar } = req.body;

  if (!name || !quote) {
    return res.status(400).json({ message: "Name and quote are required" });
  }

  try {
    const newTestimony = await prisma.testimony.create({
      data: {
        name,
        quote,
        avatar: avatar || "/profile.jpg", 
      },
    });

    res.status(201).json({ message: "Testimony added successfully", newTestimony });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete a testimony
// @route   DELETE /api/content/testimonies/:id
export const deleteTestimony = async (req: Request, res: Response) => {
  const { id } = req.params;
  const testimonyId = Number(id);

  if (isNaN(testimonyId)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  try {
    await prisma.testimony.delete({
      where: { id: testimonyId },
    });

    res.status(200).json({ message: "Testimony deleted successfully" });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Testimony not found" });
    }
    res.status(500).json({ error: error.message });
  }
};