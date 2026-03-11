import { Router } from "express";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  getCases,
  createCase,
  getCaseById,
  updateCase,
  deleteCase
} from "../controllers/caseController.js";

const router = Router();

router.use(authenticate);

router.get("/", authorizeRoles("ADMIN", "JUDGE", "LAWYER", "CLERK"), getCases);
router.post("/", authorizeRoles("ADMIN", "LAWYER", "CLERK"), createCase);
router.get("/:id", authorizeRoles("ADMIN", "JUDGE", "LAWYER", "CLERK"), getCaseById);
router.put("/:id", authorizeRoles("ADMIN", "LAWYER"), updateCase);
router.delete("/:id", authorizeRoles("ADMIN"), deleteCase);

export default router;

