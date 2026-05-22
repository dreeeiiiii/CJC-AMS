import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../db.js';
import type { AuthRequest } from '../middleware/auth.js';

// 📌 Get all users (Includes 'status' for your dashboard logic)
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
        status: true, // Added
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' } // Shows newest members first
    });
    res.status(200).json(users);
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
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Create new user (Handles Admin-added members)
export const createUsers = async (req: Request, res: Response) => {
  const { 
    firstName, 
    lastName, 
    middleInitial, // Mapped from frontend 
    email, 
    password, 
    contactNo, 
    address, 
    gender, 
    role, 
    status 
  } = req.body;

  try {
    // 1. Handle Mandatory Email: If admin didn't provide one, generate a unique temp email
    const finalEmail = email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Date.now()}@cjc.temp`;
    
    // Check if email exists
    const existingUser = await prisma.member.findUnique({ where: { email: finalEmail } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // 2. Handle Mandatory Password: Default password for new members
    const finalPassword = password || "CJC12345";
    const hashedPassword = await bcrypt.hash(finalPassword, 10);

    const newUser = await prisma.member.create({
      data: {
        firstName,
        lastName,
        middleName: middleInitial || null, // Map frontend 'middleInitial' to 'middleName'
        email: finalEmail,
        password: hashedPassword,
        contactNo,
        address,
        gender, // Ensure this is "Male" or "Female"
        status: status || 'New Member',
        role: role || 'MEMBER',
      },
    });

    res.status(201).json(newUser);
  } catch (error: any) {
    console.error("Create User Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// 📌 Update user
export const updateUsers = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { firstName, lastName, middleName, contactNo, address, gender, role, password, status } = req.body;

  try {
    const updateData: any = {
      firstName,
      lastName,
      middleName,
      contactNo,
      address,
      gender,
      role,
      status, // Added
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
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

// 📌 Update authenticated user's own profile
export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = (req.user as any).id;
    const { firstName, middleName, lastName, email, contactNo, address } = req.body;

    const updatedUser = await prisma.member.update({
      where: { id: userId },
      data: {
        firstName,
        middleName,
        lastName,
        email,
        contactNo,
        address,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ error: error.message });
  }
};

// 📌 Search members (Optimized for the Autocomplete UI)
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