import prisma from "../utils/prisma.js";

export const getAuditLogs = async (req, res) => {
  try {
    const { userId, caseId, documentId, action, from, to } = req.query;

    const where = {};
    if (userId) where.userId = Number(userId);
    if (caseId) where.caseId = Number(caseId);
    if (documentId) where.documentId = Number(documentId);
    if (action) where.action = action;
    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp.gte = new Date(from);
      if (to) where.timestamp.lte = new Date(to);
    }

    const logs = await prisma.accessLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        case: { select: { id: true, caseNumber: true, title: true } },
        document: { select: { id: true, fileName: true } }
      },
      orderBy: { timestamp: "desc" },
      take: 200
    });

    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch audit logs", error: err.message });
  }
};

