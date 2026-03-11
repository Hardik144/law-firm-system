import React from "react";

export default function DocumentTable({ documents, onDownload }) {
  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="text-left px-4 py-3 font-semibold text-slate-700">Document Name</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-700">Uploaded By</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-700">Upload Date</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-700">Action</th>
          </tr>
        </thead>
        <tbody>
          {documents?.length ? (
            documents.map((d) => (
              <tr key={d.id} className="border-b last:border-b-0">
                <td className="px-4 py-3 font-medium text-slate-900">{d.fileName}</td>
                <td className="px-4 py-3 text-slate-700">{d.uploadedBy?.name || "-"}</td>
                <td className="px-4 py-3 text-slate-700">
                  {d.uploadedAt ? new Date(d.uploadedAt).toLocaleString() : "-"}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onDownload(d)}
                    className="inline-flex items-center px-3 py-1.5 rounded-md bg-slate-900 text-white text-xs hover:bg-slate-800"
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-4 py-6 text-slate-500" colSpan={4}>
                No documents uploaded.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

