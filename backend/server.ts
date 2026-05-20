import express from "express";
// Rule: Use 'import type' for interfaces/types
import type { Request, Response } from "express";

import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";  
import { fileURLToPath } from "url";
import fs from "fs"; // 🚀 Added to safely verify and create directories

// Rule: Add .js extensions to local relative imports
import { swaggerUi, swaggerSpec } from "./swagger.js";
import prisma from "./db.js";

// Import your routes with .js extensions
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import visitorRoutes from "./routes/visitorRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js"; // 🚀 Imported modular routes

// Load environment variables
dotenv.config();

const app = express();

// --- ESM Directory Setup ---
// Required to serve static files in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🚀 Bulletproof directory handling: creates public/uploads if it doesn't exist yet
const uploadDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// --- Middleware ---
app.use(cors({
  origin: "http://localhost:5173", // Allow your frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(bodyParser.json());

// Serve the uploads folder dynamically using the absolute path
app.use('/uploads', express.static(uploadDir));

// --- Multer Configuration: Profiles ---
const profileStorage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir); // 🚀 Targets our auto-verified absolute directory path
  },
  filename: function (_req, file, cb) {
    // Prefixed unused arguments with underscores to clear ts(6133) warnings
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

const uploadProfile = multer({ storage: profileStorage });


// --- Swagger Documentation ---
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Routes ---
app.use("/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/announcements", announcementRoutes); // 🚀 Cleanly mounted announcement router here

/**
 * Profile Image Upload Route
 */
app.post('/api/upload-profile', uploadProfile.single('profileImage'), async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // 🚀 Cast userId to an Int to match your schema.prisma 'id Int @id' type constraint
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      return res.status(400).json({ error: "Invalid User ID format. Must be a valid integer." });
    }

    // Construct the URL. Use your environment variable in production
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

    // Save the URL to your PostgreSQL database using Prisma
    const updatedMember = await prisma.member.update({
      where: { id: parsedUserId },
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
    // prisma.member is correct based on your Member model in schema.prisma
    const members = await prisma.member.findMany(); 
    res.json(members);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server ready at: http://localhost:${PORT}`);
  console.log(`📑 API Docs available at: http://localhost:${PORT}/api-docs`);
});