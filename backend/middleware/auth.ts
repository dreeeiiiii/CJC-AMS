import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 1. Define what your decoded token looks like
interface DecodedToken {
  id: string;
  email: string;
  role?: string;
  // add other fields you include in your JWT payload
}

// 2. Extend the Express Request type to include 'user'
export interface AuthRequest extends Request {
  user?: string | DecodedToken | jwt.JwtPayload;
}

export const authMiddleware = (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const secret = process.env.JWT_TOKEN_SECRET;

    if (!secret) {
      throw new Error("JWT_TOKEN_SECRET is not defined in environment variables");
    }

    const decoded = jwt.verify(token, secret);
    
    // Now TypeScript knows req.user is allowed on AuthRequest
    req.user = decoded; 
    
    next();
  } catch (error: any) {
    console.error("JWT verification error:", error.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};