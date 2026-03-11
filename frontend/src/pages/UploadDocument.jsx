import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function UploadDocument() {
  const [cases, setCases] = useState([]);
  const [caseId, setCaseId] = useState("");
  const [documentType, setDocumentType] = useState("Evidence");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/cases").then((res) => setCases(res.data || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    if (!caseId) return setStatus("Select a case.");
    if (!file) return setStatus("Choose a file to upload.");

    const form = new FormData();
    form.append("caseId", caseId);
    form.append("documentType", documentType);
    form.append("file", file);

    setLoading(true);
    try {
      await api.post("/documents/upload", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setStatus("Uploaded successfully.");
      setFile(null);
      const input = document.getElementById("doc-file-input");
      if (input) input.value = "";
    } catch (err) {
      setStatus(err?.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4">
        <div className="text-lg font-semibold text-slate-900">Upload Document</div>
        <div className="text-sm text-slate-500">Attach documents to a case with auditing enabled.</div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-4 space-y-4 max-w-2xl">
        {status && (
          <div className="text-sm px-3 py-2 rounded-md border bg-slate-50 text-slate-700">{status}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700">Case</label>
          <select
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
            className="mt-1 w-full border rounded-md px-3 py-2 bg-white"
          >
            <option value="">Select a case</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.caseNumber} — {c.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Document Type</label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="mt-1 w-full border rounded-md px-3 py-2 bg-white"
          >
            <option>Evidence</option>
            <option>Pleading</option>
            <option>Order</option>
            <option>Motion</option>
            <option>Transcript</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">File</label>
          <input
            id="doc-file-input"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mt-1 w-full"
          />
        </div>

        <button
          disabled={loading}
          type="submit"
          className="px-4 py-2 rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700 disabled:opacity-60"
        >
          {loading ? "Uploading..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

