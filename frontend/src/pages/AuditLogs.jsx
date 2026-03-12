import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    userId: "",
    caseId: "",
    action: ""
  });

  const load = () => {
    setLoading(true);
    api
      .get("/audit/logs", { params: filters })
      .then((res) => setLogs(res.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (field) => (e) => {
    setFilters((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleApply = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <div className="text-lg font-semibold text-slate-900">Audit Logs</div>
        <div className="text-sm text-slate-500">
          Review who accessed which cases and documents.
        </div>
      </div>

      <form
        onSubmit={handleApply}
        className="bg-white border rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
      >
        <div>
          <label className="block text-xs font-medium text-slate-700">User ID</label>
          <input
            value={filters.userId}
            onChange={handleChange("userId")}
            className="mt-1 w-full border rounded-md px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700">Case ID</label>
          <input
            value={filters.caseId}
            onChange={handleChange("caseId")}
            className="mt-1 w-full border rounded-md px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700">Action contains</label>
          <input
            value={filters.action}
            onChange={handleChange("action")}
            className="mt-1 w-full border rounded-md px-2 py-1 text-sm"
          />
        </div>
        <div>
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700 w-full"
          >
            Apply
          </button>
        </div>
      </form>

      <div className="bg-white border rounded-lg overflow-auto">
        {loading ? (
          <div className="px-4 py-3 text-sm text-slate-500">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="px-4 py-3 text-sm text-slate-500">No logs.</div>
        ) : (
          <table className="min-w-full text-xs">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-3 py-2 font-semibold text-slate-700">Time</th>
                <th className="text-left px-3 py-2 font-semibold text-slate-700">User</th>
                <th className="text-left px-3 py-2 font-semibold text-slate-700">Case</th>
                <th className="text-left px-3 py-2 font-semibold text-slate-700">Document</th>
                <th className="text-left px-3 py-2 font-semibold text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b last:border-b-0">
                  <td className="px-3 py-2">
                    {l.timestamp ? new Date(l.timestamp).toLocaleString() : ""}
                  </td>
                  <td className="px-3 py-2">
                    {l.user?.name || l.user?.email || `User #${l.userId}`}
                  </td>
                  <td className="px-3 py-2">
                    {l.case
                      ? `${l.case.caseNumber} – ${l.case.title}`
                      : l.caseId
                      ? `Case #${l.caseId}`
                      : "-"}
                  </td>
                  <td className="px-3 py-2">
                    {l.document?.fileName || (l.documentId ? `Document #${l.documentId}` : "-")}
                  </td>
                  <td className="px-3 py-2">{l.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

