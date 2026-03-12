import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import DocumentTable from "../components/DocumentTable.jsx";

export default function CaseDetails() {
  const { id } = useParams();
  const [caseItem, setCaseItem] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [comments, setComments] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", dueDate: "" });
  const [creatingTask, setCreatingTask] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [statusDraft, setStatusDraft] = useState("");
  const [assignJudgeId, setAssignJudgeId] = useState("");
  const [assignLawyerId, setAssignLawyerId] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [caseRes, docRes, tasksRes, commentsRes] = await Promise.all([
        api.get(`/cases/${id}`),
        api.get(`/documents/${id}`),
        api.get(`/cases/${id}/tasks`),
        api.get(`/cases/${id}/comments`)
      ]);
      setCaseItem(caseRes.data);
      setStatusDraft(caseRes.data?.status || "");
      setAssignJudgeId(caseRes.data?.judgeId || "");
      setDocuments(docRes.data || []);
      setTasks(tasksRes.data || []);
      setComments(commentsRes.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // load current user from localStorage for role-based UI
    try {
      const raw = localStorage.getItem("user");
      const parsed = raw ? JSON.parse(raw) : null;
      setCurrentUser(parsed);
      if (parsed?.role === "ADMIN") {
        // only admins can see full user list for assignments
        api
          .get("/users")
          .then((res) => setAllUsers(res.data || []))
          .catch(() => {});
      }
    } catch {
      setCurrentUser(null);
    }

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

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    setCreatingTask(true);
    try {
      await api.post(`/cases/${id}/tasks`, {
        title: newTask.title.trim(),
        dueDate: newTask.dueDate || null
      });
      setNewTask({ title: "", dueDate: "" });
      const res = await api.get(`/cases/${id}/tasks`);
      setTasks(res.data || []);
    } finally {
      setCreatingTask(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, status) => {
    await api.put(`/cases/${id}/tasks/${taskId}`, { status });
    const res = await api.get(`/cases/${id}/tasks`);
    setTasks(res.data || []);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setAddingComment(true);
    try {
      await api.post(`/cases/${id}/comments`, { content: newComment.trim() });
      setNewComment("");
      const res = await api.get(`/cases/${id}/comments`);
      setComments(res.data || []);
    } finally {
      setAddingComment(false);
    }
  };

  const handleSaveStatus = async () => {
    if (!statusDraft || !caseItem) return;
    await api.put(`/cases/${id}`, {
      status: statusDraft
    });
    await load();
  };

  const handleChangeJudge = async (newJudgeId) => {
    setAssignJudgeId(newJudgeId);
    await api.put(`/cases/${id}`, {
      judgeId: newJudgeId || null
    });
    await load();
  };

  const handleAddLawyer = async () => {
    if (!assignLawyerId) return;
    await api.post(`/cases/${id}/assignments`, {
      userId: assignLawyerId,
      role: "LAWYER"
    });
    setAssignLawyerId("");
    await load();
  };

  const handleRemoveLawyer = async (assignmentId) => {
    await api.delete(`/cases/${id}/assignments/${assignmentId}`);
    await load();
  };

  if (loading) return <div className="p-4 md:p-6 text-sm text-slate-500">Loading...</div>;
  if (!caseItem) return <div className="p-4 md:p-6 text-sm text-slate-500">Case not found.</div>;

  const lawyers =
    caseItem.assignments?.filter((a) => a.role === "LAWYER").map((a) => a.user?.name).filter(Boolean) || [];

  const lawyerAssignments = caseItem.assignments?.filter((a) => a.role === "LAWYER") || [];

  const judgeOptions = allUsers.filter((u) => u.role === "JUDGE");
  const lawyerOptions = allUsers.filter(
    (u) => u.role === "LAWYER" && !lawyerAssignments.some((a) => a.userId === u.id)
  );

  const role = currentUser?.role;
  const canEditStatus = Boolean(role && ["ADMIN", "CLERK", "LAWYER", "JUDGE"].includes(role));
  const canAssignJudge = role === "ADMIN";
  const canManageLawyers = role === "ADMIN" || role === "CLERK";

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
          {canEditStatus ? (
            <div className="mt-1 flex items-center gap-2">
              <select
                value={statusDraft}
                onChange={(e) => setStatusDraft(e.target.value)}
                className="border rounded-md px-2 py-1 text-sm bg-white"
              >
                <option value="Draft">Draft</option>
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Closed">Closed</option>
              </select>
              <button
                type="button"
                onClick={handleSaveStatus}
                className="px-3 py-1.5 rounded-md bg-primary-600 text-white text-xs hover:bg-primary-700"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="mt-1 text-sm font-medium text-slate-900">{caseItem.status}</div>
          )}
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">Assigned Judge</div>
          {canAssignJudge ? (
            <div className="mt-1">
              <select
                value={assignJudgeId || ""}
                onChange={(e) => handleChangeJudge(e.target.value)}
                className="border rounded-md px-2 py-1 text-sm bg-white"
              >
                <option value="">Unassigned</option>
                {judgeOptions.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="mt-1 text-sm font-medium text-slate-900">{caseItem.judge?.name || "-"}</div>
          )}
        </div>
        <div className="md:col-span-2">
          <div className="text-xs uppercase tracking-wide text-slate-500">Description</div>
          <div className="mt-1 text-sm text-slate-700">{caseItem.description}</div>
        </div>
        <div className="md:col-span-2">
          <div className="text-xs uppercase tracking-wide text-slate-500">Assigned Lawyers</div>
          <div className="mt-1 text-sm text-slate-700">{lawyers.length ? lawyers.join(", ") : "-"}</div>
          {canManageLawyers && (
            <div className="mt-3 space-y-2">
              <div className="flex flex-wrap gap-2">
                {lawyerAssignments.map((a) => (
                  <span
                    key={a.id}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-xs text-slate-800"
                  >
                    {a.user?.name || `Lawyer #${a.userId}`}
                    <button
                      type="button"
                      onClick={() => handleRemoveLawyer(a.id)}
                      className="text-slate-500 hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={assignLawyerId}
                  onChange={(e) => setAssignLawyerId(e.target.value)}
                  className="border rounded-md px-2 py-1 text-xs bg-white"
                >
                  <option value="">Add lawyer...</option>
                  {lawyerOptions.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddLawyer}
                  className="px-3 py-1.5 rounded-md bg-primary-600 text-white text-xs hover:bg-primary-700"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <div className="text-md font-semibold text-slate-900">Tasks</div>
              <div className="text-sm text-slate-500">
                Track work items for this case.
              </div>
            </div>
          </div>

          <form onSubmit={handleCreateTask} className="mb-3 bg-white border rounded-lg p-3 space-y-2">
            <div>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask((t) => ({ ...t, title: e.target.value }))}
                placeholder="New task title"
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask((t) => ({ ...t, dueDate: e.target.value }))}
                className="border rounded-md px-2 py-1 text-sm"
              />
              <button
                type="submit"
                disabled={creatingTask}
                className="px-3 py-1.5 rounded-md bg-primary-600 text-white text-xs hover:bg-primary-700 disabled:opacity-60"
              >
                {creatingTask ? "Adding..." : "Add Task"}
              </button>
            </div>
          </form>

          <div className="bg-white border rounded-lg max-h-72 overflow-auto">
            {tasks.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500">No tasks yet.</div>
            ) : (
              <ul className="divide-y">
                {tasks.map((t) => (
                  <li key={t.id} className="px-4 py-3 text-sm flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-900">{t.title}</div>
                      <div className="text-xs text-slate-500">
                        {t.dueDate ? `Due ${new Date(t.dueDate).toLocaleDateString()}` : "No due date"}
                      </div>
                    </div>
                    <select
                      value={t.status}
                      onChange={(e) => handleUpdateTaskStatus(t.id, e.target.value)}
                      className="border rounded-md px-2 py-1 text-xs bg-white"
                    >
                      <option value="Todo">Todo</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <div className="mb-3">
            <div className="text-md font-semibold text-slate-900">Discussion</div>
            <div className="text-sm text-slate-500">
              Internal comments and notes for this case.
            </div>
          </div>

          <form
            onSubmit={handleAddComment}
            className="mb-3 bg-white border rounded-lg p-3 space-y-2"
          >
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="Add a comment..."
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={addingComment}
                className="px-3 py-1.5 rounded-md bg-primary-600 text-white text-xs hover:bg-primary-700 disabled:opacity-60"
              >
                {addingComment ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </form>

          <div className="bg-white border rounded-lg max-h-72 overflow-auto">
            {comments.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500">No comments yet.</div>
            ) : (
              <ul className="divide-y">
                {comments.map((c) => (
                  <li key={c.id} className="px-4 py-3 text-sm">
                    <div className="text-xs text-slate-500 mb-1">
                      {c.author?.name || "User"} •{" "}
                      {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                    </div>
                    <div className="text-slate-800 whitespace-pre-line">{c.content}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
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

