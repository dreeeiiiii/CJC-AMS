import express from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../db.js'; 
import type { AuthRequest } from '../middleware/auth.js';

// 📌 Helper to format the full name since it's no longer in the DB
const formatFullName = (user: any) => {
  const middle = user.middleName ? ` ${user.middleName.charAt(0)}.` : '';
  return `${user.firstName}${middle} ${user.lastName}`;
};

const formatAuthUser = (user: any) => {
  const role = user.role ? String(user.role).toUpperCase() : "MEMBER";

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    middleName: user.middleName,
    fullName: formatFullName(user),
    email: user.email,
    role,
    contactNo: user.contactNo,
    address: user.address,
    profileImage: user.profileImage,
  };
};

// 📌 Helper function to handle token signing
const generateToken = (user: any) => {
  const secret = process.env.JWT_TOKEN_SECRET;
  if (!secret) {
    throw new Error("JWT_TOKEN_SECRET is missing from .env");
  }
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: (user as any).role 
    }, 
    secret, 
    { expiresIn: '1d' }
  );
};

// 📌 Register User
export const createUsersAccount = async (req: Request, res: Response) => {
  const { 
    type, 
    firstName, 
    lastName, 
    middleName,
    contactNo, 
    address, 
    gender, 
    email, 
    password, 
    churchAffiliation 
  } = req.body;

  try {
    if (type === 'member') {
      const existingUser = await prisma.member.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered as a member" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.member.create({
        data: {
          firstName,
          lastName,
          middleName: middleName || null,
          contactNo,
          address,
          gender: gender as any,
          email,
          password: hashedPassword,
        },
      });

      return res.status(201).json({ message: "Member account created successfully", id: newUser.id });
    }

    if (type === 'visitor') {
      const newVisitor = await prisma.visitor.create({
        data: {
          firstName,
          lastName,
          middleName: middleName || null,
          contactNo,
          address,
          gender: gender as any,
          email: email || null,
          category: "WalkIn",
          churchAffiliation: churchAffiliation ?? null, 
          role: "VISITOR" as any
        },
      });

      return res.status(201).json({ message: "Visitor record created successfully", id: newVisitor.id });
    }

    return res.status(400).json({ message: "Invalid registration type" });

  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// 📌 1. Dedicated Admin Login Route
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 1. Validation
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // 2. Fetch User
    const user = await prisma.member.findUnique({ where: { email } });
    
    // Generic error message for security (don't reveal if email exists)
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 4. Normalize Role
    const userRole = user.role ? user.role.toUpperCase() : "MEMBER";

    // 5. Generate Token (Ensure your generateToken function embeds the role)
    const token = generateToken(user);

    // 6. Construct Dynamically Scoped User Profile
    // Admins get a smaller payload, Members get full profile details
    const userProfile = {
      ...formatAuthUser(user),
      ...(userRole !== "MEMBER" && {
        middleName: undefined,
        contactNo: undefined,
        address: undefined,
        profileImage: undefined,
      }),
    };

    // 7. Unified Response
    return res.status(200).json({
      message: "Login successful",
      token,
      user: userProfile,
    });

  } catch (error: any) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "Internal server error during authentication" });
  }
};

// 📌 Verify User
export const verifyUser = async (req: Request, res: Response) => {  // ✅ CHANGED: AuthRequest → Request
  const authReq = req as AuthRequest;  // ✅ ADDED THIS LINE
  
  try {
    if (!authReq.user) {  // ✅ CHANGED: req.user → authReq.user
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = authReq.user.id;  // ✅ CHANGED: removed 'as any' and use authReq.user.id
    const user = await prisma.member.findUnique({
      where: { id: userId }
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ 
      authenticated: true, 
      user: formatAuthUser(user)
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};