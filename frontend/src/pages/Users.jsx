import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "CLERK" });
  const [status, setStatus] = useState("");

  const load = async () => {
    const res = await api.get("/users");
    setUsers(res.data || []);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const create = async (e) => {
    e.preventDefault();
    setStatus("");
    try {
      await api.post("/users", form);
      setForm({ name: "", email: "", password: "", role: "CLERK" });
      await load();
      setStatus("User created.");
    } catch (err) {
      setStatus(err?.response?.data?.message || "Failed to create user");
    }
  };

  const updateRole = async (u, role) => {
    await api.put(`/users/${u.id}`, { ...u, role });
    await load();
  };

  const remove = async (u) => {
    await api.delete(`/users/${u.id}`);
    await load();
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <div className="text-lg font-semibold text-slate-900">User Management</div>
        <div className="text-sm text-slate-500">Admin-only role and account management.</div>
      </div>

      <form onSubmit={create} className="bg-white border rounded-lg p-4 space-y-3 max-w-2xl">
        {status && <div className="text-sm px-3 py-2 rounded-md border bg-slate-50">{status}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-1 w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="mt-1 w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              type="password"
              className="mt-1 w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="mt-1 w-full border rounded-md px-3 py-2 bg-white"
            >
              <option value="ADMIN">Admin</option>
              <option value="JUDGE">Judge</option>
              <option value="LAWYER">Lawyer</option>
              <option value="CLERK">Clerk</option>
            </select>
          </div>
        </div>
        <button className="px-4 py-2 rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700">
          Create User
        </button>
      </form>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Email</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Role</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-b-0">
                <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                <td className="px-4 py-3 text-slate-700">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => updateRole(u, e.target.value).catch(() => {})}
                    className="border rounded-md px-2 py-1 bg-white"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="JUDGE">Judge</option>
                    <option value="LAWYER">Lawyer</option>
                    <option value="CLERK">Clerk</option>
                  </select>
                </td>
                <td className="px-4 py-3 space-x-2">
                  <button
                    onClick={() => remove(u).catch(() => {})}
                    className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!users.length && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-slate-500">
                  No users.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

