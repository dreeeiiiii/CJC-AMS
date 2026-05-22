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
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/me", protect as any, getMyProfile);
router.put("/me", protect as any, updateMyProfile);
router.get("/", getAllUsers);
router.get("/:id", getUsersById);
router.post("/", createUsers);
router.put("/:id", updateUsers);
router.delete("/:id", deleteUsers);

export default router;