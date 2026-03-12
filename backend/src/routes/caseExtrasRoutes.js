import { Router } from "express";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  getTasksForCase,
  createTaskForCase,
  updateTaskForCase
} from "../controllers/caseTaskController.js";
import {
  getCommentsForCase,
  addCommentToCase
} from "../controllers/caseCommentController.js";
import { getAuditLogs } from "../controllers/auditController.js";
import { getCasesSummary } from "../controllers/reportController.js";
import {
  addAssignmentToCase,
  removeAssignmentFromCase
} from "../controllers/caseAssignmentController.js";

const router = Router();

router.use(authenticate);

// Tasks
router.get(
  "/cases/:caseId/tasks",
  authorizeRoles("ADMIN", "JUDGE", "LAWYER", "CLERK"),
  getTasksForCase
);
router.post(
  "/cases/:caseId/tasks",
  authorizeRoles("ADMIN", "LAWYER", "CLERK"),
  createTaskForCase
);
router.put(
  "/cases/:caseId/tasks/:taskId",
  authorizeRoles("ADMIN", "LAWYER", "CLERK"),
  updateTaskForCase
);

// Comments
router.get(
  "/cases/:caseId/comments",
  authorizeRoles("ADMIN", "JUDGE", "LAWYER", "CLERK"),
  getCommentsForCase
);
router.post(
  "/cases/:caseId/comments",
  authorizeRoles("ADMIN", "JUDGE", "LAWYER", "CLERK"),
  addCommentToCase
);

// Case assignments (admin & clerk)
router.post(
  "/cases/:caseId/assignments",
  authorizeRoles("ADMIN", "CLERK"),
  addAssignmentToCase
);
router.delete(
  "/cases/:caseId/assignments/:assignmentId",
  authorizeRoles("ADMIN", "CLERK"),
  removeAssignmentFromCase
);

// Audit (admin only)
router.get("/audit/logs", authorizeRoles("ADMIN"), getAuditLogs);

// Reports
router.get(
  "/reports/cases-summary",
  authorizeRoles("ADMIN", "JUDGE", "LAWYER", "CLERK"),
  getCasesSummary
);

export default router;

