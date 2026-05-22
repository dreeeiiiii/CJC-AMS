import { Router } from "express";
import {
  submitTestimony,
  getAllTestimonies,
  getPublicTestimonies,
  approveTestimony,
  rejectTestimony,
  deleteTestimony,
} from "../controllers/testimonyController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

router.post("/", submitTestimony);

router.get("/public", getPublicTestimonies);

router.get("/", protect, adminOnly, getAllTestimonies);

router.patch("/:id/approve", protect, adminOnly, approveTestimony);
router.patch("/:id/reject", protect, adminOnly, rejectTestimony);
router.delete("/:id", protect, adminOnly, deleteTestimony);

export default router;
