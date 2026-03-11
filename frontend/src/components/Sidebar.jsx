import React from "react";
import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `block px-3 py-2 rounded-md text-sm ${
    isActive ? "bg-primary-50 text-primary-700 font-semibold" : "text-slate-700 hover:bg-slate-100"
  }`;

export default function Sidebar({ user }) {
  return (
    <aside className="w-64 bg-white border-r min-h-[calc(100vh-0px)] hidden md:block">
      <div className="p-4">
        <div className="text-xs uppercase tracking-wide text-slate-500">Navigation</div>
        <nav className="mt-3 space-y-1">
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/cases" className={linkClass}>
            Cases
          </NavLink>
          <NavLink to="/upload" className={linkClass}>
            Upload Document
          </NavLink>
          {user?.role === "ADMIN" && (
            <NavLink to="/users" className={linkClass}>
              Users
            </NavLink>
          )}
        </nav>
      </div>
      <div className="p-4 border-t text-xs text-slate-500">
        <div className="font-medium text-slate-700">Access Control</div>
        <div className="mt-1">Role: {user?.role || "-"}</div>
      </div>
    </aside>
  );
}

