import { Router } from "express";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";
import { getUsers, createUser, updateUser, deleteUser } from "../controllers/userController.js";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles("ADMIN"));

router.get("/", getUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;

