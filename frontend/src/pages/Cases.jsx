import React, { useEffect, useState } from "react";
import api from "../services/api";
import CaseTable from "../components/CaseTable.jsx";

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    caseNumber: "",
    title: "",
    description: "",
    status: "Pending",
    isRestricted: false
  });
  const [user, setUser] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    q: ""
  });

  const loadCases = () => {
    setLoading(true);
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.q) params.q = filters.q;

    api
      .get("/cases", { params })
      .then((res) => setCases(res.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // load current user from localStorage so we know role
    try {
      const raw = localStorage.getItem("user");
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    }
    loadCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.q]);

  const canCreate =
    user && (user.role === "ADMIN" || user.role === "LAWYER" || user.role === "CLERK");

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.caseNumber.trim() || !form.title.trim()) {
      setError("Case number and title are required.");
      return;
    }

    setCreating(true);
    try {
      await api.post("/cases", {
        caseNumber: form.caseNumber.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        status: form.status || "Pending"
      });
      setForm({
        caseNumber: "",
        title: "",
        description: "",
        status: "Pending"
      });
      setShowCreate(false);
      loadCases();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create case.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="flex-1">
          <div className="text-lg font-semibold text-slate-900">Cases</div>
          <div className="text-sm text-slate-500">
            Browse and manage case files for your matters.
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="border rounded-md px-2 py-1 text-sm bg-white"
          >
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
            <option value="Closed">Closed</option>
          </select>
          <input
            type="text"
            placeholder="Search case number or title"
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            className="border rounded-md px-2 py-1 text-sm"
          />
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => setShowCreate((prev) => !prev)}
            className="px-4 py-2 rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700"
          >
            {showCreate ? "Cancel" : "New Case"}
          </button>
        )}
      </div>

      {showCreate && canCreate && (
        <form
          onSubmit={handleCreate}
          className="mb-6 bg-white border rounded-lg p-4 space-y-3 max-w-3xl"
        >
          {error && (
            <div className="text-sm px-3 py-2 rounded-md border bg-red-50 text-red-700">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Case Number</label>
              <input
                value={form.caseNumber}
                onChange={handleChange("caseNumber")}
                className="mt-1 w-full border rounded-md px-3 py-2"
                placeholder="e.g. 2026-00123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <select
                value={form.status}
                onChange={handleChange("status")}
                className="mt-1 w-full border rounded-md px-3 py-2 bg-white"
              >
                <option value="Draft">Draft</option>
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.isRestricted}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, isRestricted: e.target.checked }))
                }
              />
              Restricted case (limit access)
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Title</label>
            <input
              value={form.title}
              onChange={handleChange("title")}
              className="mt-1 w-full border rounded-md px-3 py-2"
              placeholder="e.g. State vs John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={form.description}
              onChange={handleChange("description")}
              rows={3}
              className="mt-1 w-full border rounded-md px-3 py-2"
              placeholder="Short description of the matter."
            />
          </div>

          <button
            type="submit"
            disabled={creating}
            className="px-4 py-2 rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700 disabled:opacity-60"
          >
            {creating ? "Creating..." : "Create Case"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-sm text-slate-500">Loading...</div>
      ) : (
        <CaseTable cases={cases} />
      )}
    </div>
  );
}

