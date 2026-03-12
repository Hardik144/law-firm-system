import prisma from "../utils/prisma.js";

export const addAssignmentToCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ message: "userId and role are required" });
    }

    const assignment = await prisma.caseAssignment.create({
      data: {
        caseId: Number(caseId),
        userId: Number(userId),
        role
      },
      include: {
        user: { select: { id: true, name: true, role: true } }
      }
    });

    return res.status(201).json(assignment);
  } catch (err) {
    return res.status(500).json({ message: "Failed to add assignment", error: err.message });
  }
};

export const removeAssignmentFromCase = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    await prisma.caseAssignment.delete({
      where: { id: Number(assignmentId) }
    });
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: "Failed to remove assignment", error: err.message });
  }
};

