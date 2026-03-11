import prisma from "../utils/prisma.js";

export const getCases = async (req, res) => {
  try {
    const cases = await prisma.case.findMany({
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
    const { caseNumber, title, description, status, judgeId } = req.body;
    const createdById = req.user.id;

    const newCase = await prisma.case.create({
      data: {
        caseNumber,
        title,
        description,
        status,
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

    return res.json(caseItem);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch case", error: err.message });
  }
};

export const updateCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { caseNumber, title, description, status, judgeId } = req.body;

    const updated = await prisma.case.update({
      where: { id: Number(id) },
      data: {
        caseNumber,
        title,
        description,
        status,
        judgeId: judgeId ? Number(judgeId) : null
      }
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

