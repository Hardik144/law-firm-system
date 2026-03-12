import prisma from "../utils/prisma.js";

export const getTasksForCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const tasks = await prisma.caseTask.findMany({
      where: { caseId: Number(caseId) },
      include: {
        assignee: { select: { id: true, name: true, role: true } }
      },
      orderBy: { createdAt: "asc" }
    });
    return res.json(tasks);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch tasks", error: err.message });
  }
};

export const createTaskForCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { title, description, assigneeId, dueDate } = req.body;

    const task = await prisma.caseTask.create({
      data: {
        caseId: Number(caseId),
        title,
        description,
        assigneeId: assigneeId ? Number(assigneeId) : null,
        dueDate: dueDate ? new Date(dueDate) : null
      }
    });

    return res.status(201).json(task);
  } catch (err) {
    return res.status(500).json({ message: "Failed to create task", error: err.message });
  }
};

export const updateTaskForCase = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, assigneeId, dueDate, status } = req.body;

    const task = await prisma.caseTask.update({
      where: { id: Number(taskId) },
      data: {
        title,
        description,
        assigneeId: assigneeId ? Number(assigneeId) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        status
      }
    });

    return res.json(task);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update task", error: err.message });
  }
};

