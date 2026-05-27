import type { Request, Response } from 'express';
import prisma from '../db.js';
import verses from '../data/verses.json' with { type: "json" };

// @desc    Get the current active Verse of the Day
// @route   GET /api/content/verse/tod

export const getActiveVerse = async (req: Request, res: Response) => {
  try {
    // Force the date calculation to use Philippine Standard Time
    const manilaString = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });
    const now = new Date(manilaString);
    
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    // 2. Safely cycle through the array using modulo math
    const verseIndex = (dayOfYear - 1) % verses.length;
    const verseOfTheDay = verses[verseIndex];

    if (!verseOfTheDay) {
      return res.status(404).json({ message: "No active verse found in the local file." });
    }

    return res.status(200).json({
      content: verseOfTheDay.text, 
      reference: verseOfTheDay.reference,
      version: verseOfTheDay.version,    
      category: verseOfTheDay.category   
    });

  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Internal server error" });
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
      where: { status: "approved" },
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