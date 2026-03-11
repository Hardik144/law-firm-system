import React, { useEffect, useState } from "react";
import api from "../services/api";

function StatCard({ title, value }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCases: 0,
    activeCases: 0,
    documentsUploaded: 0,
    pendingCases: 0
  });

  useEffect(() => {
    const load = async () => {
      const [casesRes] = await Promise.all([api.get("/cases")]);
      const cases = casesRes.data || [];
      const active = cases.filter((c) => (c.status || "").toLowerCase() === "active").length;
      const pending = cases.filter((c) => (c.status || "").toLowerCase() === "pending").length;
      setStats((s) => ({
        ...s,
        totalCases: cases.length,
        activeCases: active,
        pendingCases: pending
      }));
    };
    load().catch(() => {});
  }, []);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4">
        <div className="text-lg font-semibold text-slate-900">Dashboard</div>
        <div className="text-sm text-slate-500">Overview of case workload and activity.</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Cases" value={stats.totalCases} />
        <StatCard title="Active Cases" value={stats.activeCases} />
        <StatCard title="Documents Uploaded" value={stats.documentsUploaded} />
        <StatCard title="Pending Cases" value={stats.pendingCases} />
      </div>
    </div>
  );
}
