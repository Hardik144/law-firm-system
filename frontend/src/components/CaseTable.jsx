import React from "react";
import { Link } from "react-router-dom";

export default function CaseTable({ cases }) {
  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="text-left px-4 py-3 font-semibold text-slate-700">Case Number</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-700">Title</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-700">Judge</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-700">Status</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-700">Action</th>
          </tr>
        </thead>
        <tbody>
          {cases?.length ? (
            cases.map((c) => (
              <tr key={c.id} className="border-b last:border-b-0">
                <td className="px-4 py-3 font-medium text-slate-900">{c.caseNumber}</td>
                <td className="px-4 py-3 text-slate-700">{c.title}</td>
                <td className="px-4 py-3 text-slate-700">{c.judge?.name || "-"}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700">
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/cases/${c.id}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-md bg-primary-600 text-white text-xs hover:bg-primary-700"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-4 py-6 text-slate-500" colSpan={5}>
                No cases found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

