import { Router } from "express";
import { 
  getAllUsers, 
  getUsersById, 
  createUsers, 
  updateUsers, 
  deleteUsers 
} from "../controllers/userControllers.js";

const router = Router();

router.get("/", getAllUsers);
router.get("/:id", getUsersById);
router.post("/", createUsers);
router.put("/:id", updateUsers);
router.delete("/:id", deleteUsers);

export default router;