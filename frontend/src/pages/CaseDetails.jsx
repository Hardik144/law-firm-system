import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import DocumentTable from "../components/DocumentTable.jsx";

export default function CaseDetails() {
  const { id } = useParams();
  const [caseItem, setCaseItem] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [caseRes, docRes] = await Promise.all([api.get(`/cases/${id}`), api.get(`/documents/${id}`)]);
      setCaseItem(caseRes.data);
      setDocuments(docRes.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDownload = async (doc) => {
    const res = await api.get(`/documents/download/${doc.id}`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <div className="p-4 md:p-6 text-sm text-slate-500">Loading...</div>;
  if (!caseItem) return <div className="p-4 md:p-6 text-sm text-slate-500">Case not found.</div>;

  const lawyers =
    caseItem.assignments?.filter((a) => a.role === "LAWYER").map((a) => a.user?.name).filter(Boolean) || [];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-semibold text-slate-900">{caseItem.title}</div>
          <div className="text-sm text-slate-500">Case #{caseItem.caseNumber}</div>
        </div>
        <Link
          to="/upload"
          className="px-4 py-2 rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700"
        >
          Upload Document
        </Link>
      </div>

      <div className="bg-white border rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">Status</div>
          <div className="mt-1 text-sm font-medium text-slate-900">{caseItem.status}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">Assigned Judge</div>
          <div className="mt-1 text-sm font-medium text-slate-900">{caseItem.judge?.name || "-"}</div>
        </div>
        <div className="md:col-span-2">
          <div className="text-xs uppercase tracking-wide text-slate-500">Description</div>
          <div className="mt-1 text-sm text-slate-700">{caseItem.description}</div>
        </div>
        <div className="md:col-span-2">
          <div className="text-xs uppercase tracking-wide text-slate-500">Assigned Lawyers</div>
          <div className="mt-1 text-sm text-slate-700">{lawyers.length ? lawyers.join(", ") : "-"}</div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <div className="text-md font-semibold text-slate-900">Documents</div>
            <div className="text-sm text-slate-500">Download and audit access to case documents.</div>
          </div>
          <button
            onClick={() => load().catch(() => {})}
            className="px-3 py-2 rounded-md border bg-white text-sm hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
        <DocumentTable documents={documents} onDownload={handleDownload} />
      </div>
    </div>
  );
}

