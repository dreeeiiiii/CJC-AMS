import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import { initCronJobs } from './utils/cron.js';

import cors from "cors";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";  
import { fileURLToPath } from "url";
import fs from "fs";

import { swaggerUi, swaggerSpec } from "./swagger.js";
import prisma from "./db.js";
import { protect } from "./middleware/auth.js";
import { uploadToCloudinary } from "./config/cloudinary.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import visitorRoutes from "./routes/visitorRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import testimonyRoutes from "./routes/testimonyRoutes.js";
import forgotPasswordRoutes from "./routes/forgotPasswordRoutes.js";
import { googleLogin } from "./controllers/googleAuthControllers.js";

const app = express();

// --- ESM Directory Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory from .env
const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// --- CORS - ONLY from FRONTEND_URL in .env (NO FALLBACK) ---
if (!process.env.FRONTEND_URL) {
  console.error("❌ FRONTEND_URL is not set in .env. CORS will block all requests!");
  process.exit(1);
}

const allowedOrigins = [process.env.FRONTEND_URL];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(bodyParser.json());

// Serve static files
app.use('/uploads', express.static(uploadDir));

// Multer configuration
const uploadProfile = multer({ storage: multer.memoryStorage() });

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/testimonies", testimonyRoutes);
app.use("/api", forgotPasswordRoutes);

/**
 * Profile Image Upload Route (using Cloudinary from .env)
 */
app.post('/api/upload-profile', protect as any, uploadProfile.single('profileImage'), async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = (req.user as any).id;
    let imageUrl: string;

    // Cloudinary is configured via .env
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const result = await uploadToCloudinary(req.file.buffer, 'profiles');
      imageUrl = (result as any).secure_url;
    } else {
      // Fallback to local storage - but BASE_URL must be in .env
      if (!process.env.BASE_URL) {
        throw new Error("BASE_URL not configured in .env for local file serving");
      }
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(req.file.originalname);
      const filename = 'profile-' + uniqueSuffix + ext;
      const filepath = path.join(uploadDir, filename);
      fs.writeFileSync(filepath, req.file.buffer);
      imageUrl = `${process.env.BASE_URL}/uploads/${filename}`;
    }

    const updatedMember = await prisma.member.update({
      where: { id: userId },
      data: { profileImage: imageUrl }
    });

    res.json({ 
      message: "Profile image updated successfully", 
      imageUrl: updatedMember.profileImage 
    });

  } catch (error: any) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: error.message || "Server error during upload" });
  }
});

/**
 * Test Route
 */
app.get('/test', async (req: Request, res: Response) => {
  try {
    const members = await prisma.member.findMany(); 
    res.json(members);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  initCronJobs();
  console.log(`🚀 Server ready on port: ${PORT}`);
  console.log(`📑 API Docs available at: ${process.env.BASE_URL || 'http://localhost:' + PORT}/api-docs`);
  console.log(`🔗 Frontend URL from .env: ${process.env.FRONTEND_URL}`);
  console.log(`✅ CORS allowing: ${allowedOrigins.join(', ')}`);
});