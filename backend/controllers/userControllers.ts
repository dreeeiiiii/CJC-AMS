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
        profileImage: true, // Added to ensure visibility across lists
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
    contact,
    address,
    gender,
    role,
    status,
    profileImage,
    mode
  } = req.body;

  try {

    // -----------------------------
    // 🟦 ADMIN MODE (PROFILE ONLY)
    // -----------------------------
    if (mode === "admin") {
      const newMember = await prisma.member.create({
        data: {
          firstName,
          lastName,
          middleName: middleName || middleInitial || null,
          contactNo: contactNo || contact,
          address,
          gender,
          status: status || "New Member",
          profileImage: profileImage || null,
        },
      });

      return res.status(201).json(newMember);
    }

    // -----------------------------
    // 🟩 SIGNUP MODE (AUTH + MEMBER)
    // -----------------------------
    if (mode === "signup") {
      if (!email || !password) {
        return res.status(400).json({
          message: "Email and password required"
        });
      }

      // CHECK EMAIL IN AUTH TABLE (NOT MEMBER)
      const existingAccount = await prisma.userAccount.findUnique({
        where: { email }
      });

      if (existingAccount) {
        return res.status(400).json({
          message: "Email already in use"
        });
      }

      // CREATE MEMBER FIRST
      const newMember = await prisma.member.create({
        data: {
          firstName,
          lastName,
          middleName: middleName || middleInitial || null,
          contactNo: contactNo || contact,
          address,
          gender,
          status: status || "New Member",
          profileImage: profileImage || null,
        },
      });

      // CREATE USER ACCOUNT LINKED TO MEMBER
      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.userAccount.create({
        data: {
          email,
          password: hashedPassword,
          role: role || "MEMBER",
          memberId: newMember.id
        },
      });

      return res.status(201).json(newMember);
    }

    return res.status(400).json({
      message: "Invalid mode"
    });

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};


// 📌 Update user (Admin Dashboard endpoint)
export const updateUsers = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { firstName, lastName, middleName, contactNo, address, gender, role, password, status, profileImage } = req.body;

  try {
    const updateData: any = {
      firstName,
      lastName,
      middleName,
      contactNo,
      address,
      gender,
      role,
      status,
      profileImage, // Persistent update directly inside your DB instance
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

// 📌 Update authenticated user's own profile text information 
export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = (req.user as any).id;
    const { firstName, middleName, lastName, email, contactNo, address } = req.body;

    // Writes directly to SQL layer via Prisma Client engine interface
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