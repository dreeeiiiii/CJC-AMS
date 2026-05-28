import type { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../db.js';
import { Gender } from '@prisma/client';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  throw new Error('GOOGLE_CLIENT_ID is missing in .env');
}

const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET;

if (!JWT_TOKEN_SECRET) {
  throw new Error('JWT_TOKEN_SECRET is missing in .env');
}

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export const googleLogin = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      message: 'Google token is required',
    });
  }

  try {
    // Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        message: 'Invalid Google token',
      });
    }

    const email = payload.email;

    if (!email) {
      return res.status(400).json({
        message: 'Google account has no email',
      });
    }

    const firstName = payload.given_name || 'Google';
    const lastName = payload.family_name || 'User';
    const profileImage = payload.picture || null;

    // Check existing user
    let user = await prisma.member.findUnique({
      where: { email },
    });

    // Auto-create if not existing
    if (!user) {
      const hashedPassword = await bcrypt.hash('newmember', 10);

      user = await prisma.member.create({
        data: {
          firstName,
          lastName,
          middleName: null,
          email,
          password: hashedPassword,
          contactNo: 'N/A',
          address: 'N/A',
          gender: Gender.Male,
          status: 'New Member',
          role: 'MEMBER' as any,
          profileImage,
        },
      });
    }

    // Generate JWT
    const authToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role || 'MEMBER',
      },
      JWT_TOKEN_SECRET,
      {
        expiresIn: '7d',
      }
    );

    return res.status(200).json({
      message: 'Google login successful',
      token: authToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName,
        email: user.email,
        role: user.role,
        status: user.status,
        profileImage: user.profileImage,
      },
    });

  } catch (error: any) {
    console.error('Google Login Error:', error);

    return res.status(500).json({
      message: 'Google authentication failed',
      error: error.message,
    });
  }
};