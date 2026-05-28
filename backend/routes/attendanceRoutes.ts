import { Router } from "express";
import {
  recordAttendance,
  getRecentActivity,
  getAttendanceStats,
  getAttendanceSummary,
  getAllAttendance,
  exportAttendance,
  deleteAttendance,
  getMemberAttendance
} from "../controllers/attendanceController.js";

import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

// 📌 CREATE attendance (QR + manual)
router.post("/", protect, adminOnly, recordAttendance);

// 📊 DASHBOARD
router.get("/recent", protect, adminOnly, getRecentActivity);
router.get("/stats", protect, adminOnly, getAttendanceStats);
router.get("/my-attendance",protect,getMemberAttendance);

// (optional: if this is personal dashboard)
router.get("/my-summary", getAttendanceSummary);

// 📋 DATA
router.get("/", protect, adminOnly, getAllAttendance);

// 📤 EXPORT
router.get("/export", protect, adminOnly, exportAttendance);

// 🗑 DELETE
router.delete("/:id", protect, adminOnly, deleteAttendance);

export default router;