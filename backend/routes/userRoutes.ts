import { Router } from "express";
import {
  getAllUsers,
  getUsersById,
  createUsers,
  updateUsers,
  deleteUsers,
  getMyProfile,
  updateMyProfile
} from "../controllers/userControllers.js";

import { protect, adminOnly } from "../middleware/auth.js";
import { changePassword } from "../controllers/userControllers.js";

const router = Router();

// 👤 Authenticated user routes
router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);
router.put("/me/password", protect as any, changePassword);

// 👥 Admin / system user management
router.get("/", protect, adminOnly, getAllUsers);
router.get("/:id", protect, adminOnly, getUsersById);
router.post("/", protect, adminOnly, createUsers);
router.put("/:id", protect, adminOnly, updateUsers);
router.delete("/:id", protect, adminOnly, deleteUsers);

export default router;