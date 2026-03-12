import prisma from "../utils/prisma.js";

export const getCasesSummary = async (req, res) => {
  try {
    const cases = await prisma.case.findMany({
      include: { judge: true }
    });

    const totalCases = cases.length;
    const byStatus = {};
    const byJudge = {};

    cases.forEach((c) => {
      const statusKey = (c.status || "Unknown").toString();
      byStatus[statusKey] = (byStatus[statusKey] || 0) + 1;

      if (c.judge) {
        const jKey = c.judge.name || `Judge #${c.judge.id}`;
        byJudge[jKey] = (byJudge[jKey] || 0) + 1;
      }
    });

    const byJudgeArr = Object.entries(byJudge).map(([judgeName, count]) => ({
      judgeName,
      caseCount: count
    }));

    return res.json({
      totalCases,
      byStatus,
      byJudge: byJudgeArr
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to build summary", error: err.message });
  }
};

