import prisma from "../utils/prisma.js";

export const getCases = async (req, res) => {
  try {
    const { status, judgeId, q } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }
    if (judgeId) {
      where.judgeId = Number(judgeId);
    }
    if (q) {
      where.OR = [
        { caseNumber: { contains: q, mode: "insensitive" } },
        { title: { contains: q, mode: "insensitive" } }
      ];
    }

    const cases = await prisma.case.findMany({
      where,
      include: {
        judge: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    return res.json(cases);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch cases", error: err.message });
  }
};

export const createCase = async (req, res) => {
  try {
    const { caseNumber, title, description, status, judgeId, isRestricted } = req.body;
    const createdById = req.user.id;

    const newCase = await prisma.case.create({
      data: {
        caseNumber,
        title,
        description,
        status: status || "Pending",
        isRestricted: Boolean(isRestricted),
        judgeId: judgeId ? Number(judgeId) : null,
        createdById
      }
    });

    return res.status(201).json(newCase);
  } catch (err) {
    return res.status(500).json({ message: "Failed to create case", error: err.message });
  }
};

export const getCaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const caseItem = await prisma.case.findUnique({
      where: { id: Number(id) },
      include: {
        judge: { select: { id: true, name: true } },
        assignments: {
          include: {
            user: { select: { id: true, name: true, role: true } }
          }
        },
        documents: true
      }
    });

    if (!caseItem) {
      return res.status(404).json({ message: "Case not found" });
    }

    // If case is restricted, only allow creator, judge, or admin to view
    if (
      caseItem.isRestricted &&
      req.user.role !== "ADMIN" &&
      req.user.id !== caseItem.createdById &&
      req.user.id !== caseItem.judgeId
    ) {
      return res.status(403).json({ message: "Restricted case" });
    }

    return res.json(caseItem);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch case", error: err.message });
  }
};

export const updateCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { caseNumber, title, description, status, judgeId } = req.body;

    // Enforce simple role-based status transitions
    if (typeof status !== "undefined") {
      const role = req.user.role;
      const allowedByRole = {
        ADMIN: ["Draft", "Pending", "Active", "On Hold", "Closed"],
        CLERK: ["Draft", "Pending"],
        LAWYER: ["Pending", "Active", "On Hold"],
        JUDGE: ["Active", "On Hold", "Closed"]
      };
      const allowedStatuses = allowedByRole[role] || [];
      if (!allowedStatuses.includes(status)) {
        return res
          .status(403)
          .json({ message: `Role ${role} cannot set status to ${status}` });
      }
    }

    const data = {};
    if (typeof caseNumber !== "undefined") data.caseNumber = caseNumber;
    if (typeof title !== "undefined") data.title = title;
    if (typeof description !== "undefined") data.description = description;
    if (typeof status !== "undefined") data.status = status;
    if (typeof judgeId !== "undefined") {
      data.judgeId = judgeId ? Number(judgeId) : null;
    }

    const updated = await prisma.case.update({
      where: { id: Number(id) },
      data
    });

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update case", error: err.message });
  }
};

export const deleteCase = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.case.delete({ where: { id: Number(id) } });
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete case", error: err.message });
  }
};

