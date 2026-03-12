import prisma from "../utils/prisma.js";

export const getCommentsForCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const comments = await prisma.caseComment.findMany({
      where: { caseId: Number(caseId) },
      include: {
        author: { select: { id: true, name: true, role: true } }
      },
      orderBy: { createdAt: "asc" }
    });
    return res.json(comments);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch comments", error: err.message });
  }
};

export const addCommentToCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Content is required" });
    }

    const comment = await prisma.caseComment.create({
      data: {
        caseId: Number(caseId),
        authorId: req.user.id,
        content: content.trim()
      },
      include: {
        author: { select: { id: true, name: true, role: true } }
      }
    });

    return res.status(201).json(comment);
  } catch (err) {
    return res.status(500).json({ message: "Failed to add comment", error: err.message });
  }
};

