import React from "react";

export default function Navbar({ user, onLogout }) {
  return (
    <div className="w-full flex items-center justify-between px-4 py-3 bg-white border-b">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold">
          LF
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">Law Firm Case Management</div>
          <div className="text-xs text-slate-500">Case Files & Access Control</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-medium text-slate-900">{user?.name || "User"}</div>
          <div className="text-xs text-slate-500">{user?.role || ""}</div>
        </div>
        <button
          onClick={onLogout}
          className="px-3 py-2 rounded-md bg-slate-900 text-white text-sm hover:bg-slate-800"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

