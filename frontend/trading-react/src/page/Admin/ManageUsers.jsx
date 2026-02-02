// src/page/Admin/ManageUsers.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5454";

export default function ManageUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [notice, setNotice] = useState(null);

  // UI state
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  // inline edit state: {id -> { fullName, phoneNo, role }}
  const [editing, setEditing] = useState({});

  // fetch users
  async function loadUsers() {
    setLoading(true);
    setNotice(null);
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE}/admin/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json().catch(() => []);
      if (!res.ok) {
        setNotice({ type: "error", text: data?.message || `Failed to load users (${res.status})` });
        setUsers([]);
      } else {
        // normalize to array
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setNotice({ type: "error", text: err.message || "Network error" });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  // filtering + pagination
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      return (
        (u.fullName && u.fullName.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phoneNo && String(u.phoneNo).includes(q))
      );
    });
  }, [users, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function gotoPage(p) {
    setPage(Math.max(1, Math.min(totalPages, p)));
  }

  // start editing a user
  function startEdit(u) {
    setEditing((s) => ({ ...s, [u.id]: { fullName: u.fullName || "", phoneNo: u.phoneNo || "", role: u.userRole || u.role || "CUSTOMER" } }));
  }

  function cancelEdit(id) {
    setEditing((s) => {
      const copy = { ...s };
      delete copy[id];
      return copy;
    });
  }

  function onEditChange(id, field, value) {
    setEditing((s) => ({ ...s, [id]: { ...s[id], [field]: value } }));
  }

  async function saveEdit(id) {
    const payload = editing[id];
    if (!payload) return;
    setActionId(id);
    setNotice(null);
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice({ type: "error", text: data?.message || `Save failed (${res.status})` });
      } else {
        // update local list: replace user item using returned data if provided, else merge payload
        setUsers((prev) => prev.map((u) => (u.id === id ? (data?.id ? { ...u, ...data } : { ...u, ...payload }) : u)));
        cancelEdit(id);
        setNotice({ type: "success", text: "User updated" });
      }
    } catch (err) {
      setNotice({ type: "error", text: err.message || "Network error" });
    } finally {
      setActionId(null);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete user? This is irreversible.")) return;
    setActionId(id);
    setNotice(null);
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice({ type: "error", text: data?.message || `Delete failed (${res.status})` });
      } else {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        setNotice({ type: "success", text: "User deleted" });
      }
    } catch (err) {
      setNotice({ type: "error", text: err.message || "Network error" });
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="w-full text-white">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Manage Users</h1>
            <p className="text-slate-400 text-sm mt-1">View, edit or remove users.</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search name / email / phone"
              className="px-3 py-2 rounded-md bg-[#071129] border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0b69ff]"
            />
            <Button onClick={() => navigate("/admin/create-user")}>Create User</Button>
          </div>
        </div>

        {notice && (
          <div className={`mb-4 p-3 rounded ${notice.type === "success" ? "bg-green-900/30 text-green-200" : "bg-red-900/30 text-red-200"}`}>
            {notice.text}
          </div>
        )}

        <div className="bg-[#071129] p-2 rounded-md border border-white/5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-300">
              <tr>
                <th className="py-3 px-3 w-16">ID</th>
                <th className="py-3 px-3">Name</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3 w-40">Phone</th>
                <th className="py-3 px-3 w-36">Role</th>
                <th className="py-3 px-3 w-44 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">Loading users…</td>
                </tr>
              )}

              {!loading && pageData.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">No users found.</td>
                </tr>
              )}

              {!loading &&
                pageData.map((u) => {
                  const isEditing = Boolean(editing[u.id]);
                  const editState = editing[u.id] || {};
                  return (
                    <tr key={u.id} className="border-t border-white/5 hover:bg-white/5 transition">
                      <td className="py-3 px-3 text-slate-300 align-top">{u.id}</td>

                      <td className="py-3 px-3 align-top">
                        {isEditing ? (
                          <input
                            value={editState.fullName}
                            onChange={(e) => onEditChange(u.id, "fullName", e.target.value)}
                            className="w-full px-2 py-1 rounded bg-[#061021] border border-white/5 text-white text-sm"
                          />
                        ) : (
                          <div className="flex flex-col">
                            <span>{u.fullName || "—"}</span>
                            <span className="text-xs text-slate-400">ID: {u.id}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 align-top text-slate-300">
                        {u.email}
                      </td>

                      <td className="py-3 px-3 align-top">
                        {isEditing ? (
                          <input
                            value={editState.phoneNo}
                            onChange={(e) => onEditChange(u.id, "phoneNo", e.target.value)}
                            className="w-full px-2 py-1 rounded bg-[#061021] border border-white/5 text-white text-sm"
                          />
                        ) : (
                          u.phoneNo || "—"
                        )}
                      </td>

                      <td className="py-3 px-3 align-top">
                        {isEditing ? (
                          <select
                            value={editState.role}
                            onChange={(e) => onEditChange(u.id, "role", e.target.value)}
                            className="px-2 py-1 rounded bg-[#061021] border border-white/5 text-white text-sm"
                          >
                            <option value="CUSTOMER">Customer</option>
                            <option value="MODERATOR">Moderator</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        ) : (
                          <span className="text-sm">{u.userRole || u.role || "CUSTOMER"}</span>
                        )}
                      </td>

                      <td className="py-3 px-3 align-top text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button
                                disabled={actionId === u.id}
                                onClick={() => saveEdit(u.id)}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs"
                              >
                                <CheckIcon className="w-4 h-4" /> Save
                              </button>
                              <button
                                disabled={actionId === u.id}
                                onClick={() => cancelEdit(u.id)}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white text-xs"
                              >
                                <XMarkIcon className="w-4 h-4" /> Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(u)}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#0b69ff] hover:bg-[#095fd8] text-white text-xs"
                              >
                                <PencilIcon className="w-4 h-4" /> Edit
                              </button>

                              <button
                                onClick={() => handleDelete(u.id)}
                                disabled={actionId === u.id}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-700 hover:bg-red-600 text-white text-xs"
                              >
                                <TrashIcon className="w-4 h-4" /> Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => gotoPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-[#061126] hover:bg-[#0b1630] text-slate-200 text-sm"
            >
              Prev
            </button>

            <div className="text-sm text-slate-300 px-2">Page {page} / {totalPages}</div>

            <button
              onClick={() => gotoPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 rounded bg-[#061126] hover:bg-[#0b1630] text-slate-200 text-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
