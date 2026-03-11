import path from "path";
import { fileURLToPath } from "url";
import prisma from "../utils/prisma.js";
import { logAccess } from "../services/accessLogService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadDocument = async (req, res) => {
  try {
    const { caseId, documentType } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const caseExists = await prisma.case.findUnique({
      where: { id: Number(caseId) }
    });
    if (!caseExists) {
      return res.status(404).json({ message: "Case not found" });
    }

    const existingCount = await prisma.document.count({
      where: { caseId: Number(caseId), fileName: file.originalname }
    });

    const document = await prisma.document.create({
      data: {
        caseId: Number(caseId),
        fileName: file.originalname,
        filePath: file.path,
        version: existingCount + 1,
        uploadedById: req.user.id
      }
    });

    await logAccess({
      userId: req.user.id,
      caseId: Number(caseId),
      documentId: document.id,
      action: `UPLOAD_DOCUMENT${documentType ? `:${documentType}` : ""}`
    });

    return res.status(201).json(document);
  } catch (err) {
    return res.status(500).json({ message: "Failed to upload document", error: err.message });
  }
};

export const getDocumentsByCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const documents = await prisma.document.findMany({
      where: { caseId: Number(caseId) },
      include: {
        uploadedBy: { select: { id: true, name: true } }
      },
      orderBy: { uploadedAt: "desc" }
    });

    await logAccess({
      userId: req.user.id,
      caseId: Number(caseId),
      action: "VIEW_DOCUMENT_LIST"
    });

    return res.json(documents);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch documents", error: err.message });
  }
};

export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await prisma.document.findUnique({
      where: { id: Number(id) }
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    await logAccess({
      userId: req.user.id,
      caseId: document.caseId,
      documentId: document.id,
      action: "DOWNLOAD_DOCUMENT"
    });

    const absolutePath = path.isAbsolute(document.filePath)
      ? document.filePath
      : path.join(__dirname, "..", "..", document.filePath);

    return res.download(absolutePath, document.fileName);
  } catch (err) {
    return res.status(500).json({ message: "Failed to download document", error: err.message });
  }
};

