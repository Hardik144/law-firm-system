import { Router } from "express";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import {
  uploadDocument,
  getDocumentsByCase,
  downloadDocument
} from "../controllers/documentController.js";

const router = Router();

router.use(authenticate);

router.post(
  "/upload",
  authorizeRoles("ADMIN", "LAWYER", "CLERK"),
  upload.single("file"),
  uploadDocument
);

router.get(
  "/:caseId",
  authorizeRoles("ADMIN", "JUDGE", "LAWYER", "CLERK"),
  getDocumentsByCase
);

router.get(
  "/download/:id",
  authorizeRoles("ADMIN", "JUDGE", "LAWYER", "CLERK"),
  downloadDocument
);

export default router;

