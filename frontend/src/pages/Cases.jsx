import React, { useEffect, useState } from "react";
import api from "../services/api";
import CaseTable from "../components/CaseTable.jsx";

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/cases")
      .then((res) => setCases(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-slate-900">Cases</div>
          <div className="text-sm text-slate-500">Browse and manage case files.</div>
        </div>
      </div>
      {loading ? (
        <div className="text-sm text-slate-500">Loading...</div>
      ) : (
        <CaseTable cases={cases} />
      )}
    </div>
  );
}

