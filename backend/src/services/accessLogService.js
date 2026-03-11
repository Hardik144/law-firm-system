import prisma from "../utils/prisma.js";

export const logAccess = async ({ userId, caseId = null, documentId = null, action }) => {
  try {
    await prisma.accessLog.create({
      data: {
        userId,
        caseId,
        documentId,
        action
      }
    });
  } catch (err) {
    // Intentionally swallow errors to avoid impacting main flow
    // eslint-disable-next-line no-console
    console.error("Failed to log access", err);
  }
};

