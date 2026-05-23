import { Router } from "express";
import { 
  recordAttendance, 
  getRecentActivity, 
  getAttendanceStats,
  exportAttendance,
  deleteAttendance 
} from "../controllers/attendanceController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

// Admin only activities
router.post("/", protect, adminOnly, recordAttendance);
router.get("/recent", protect, adminOnly, getRecentActivity);
router.get("/stats", protect, adminOnly, getAttendanceStats);
router.get("/export", protect, adminOnly, exportAttendance);
router.delete("/:id", protect, adminOnly, deleteAttendance);

export default router;