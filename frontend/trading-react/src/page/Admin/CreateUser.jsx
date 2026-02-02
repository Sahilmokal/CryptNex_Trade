// src/page/Admin/CreateUser.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

export default function CreateUser() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phoneNo: "", role: "CUSTOMER" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const API_URL = "http://localhost:5454/admin/users";

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function validate() {
    const e = {};
    if (!form.fullName || form.fullName.trim().length < 2) e.fullName = "Enter full name";
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Valid email required";
    if (!form.password || form.password.length < 6) e.password = "Password must be at least 6 characters";
    if (form.phoneNo && !/^\d{7,15}$/.test(form.phoneNo)) e.phoneNo = "Enter valid phone number";
    return e;
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    setNotice(null);
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.message || (data?.errors && data.errors.map((i) => i.msg).join(",")) || `Failed (${res.status})`;
        setNotice({ type: "error", text: msg });
      } else {
        setNotice({ type: "success", text: data?.message || "User created successfully", userId: data?.userId || null });
        setForm({ fullName: "", email: "", password: "", phoneNo: "", role: "CUSTOMER" });
        setTimeout(() => navigate("/admin/manage-users"), 1400);
      }
    } catch (err) {
      setNotice({ type: "error", text: err.message || "Network error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    // this container matches the main content area spacing (no outer card)
    <div className="w-full text-white">
      <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Create User</h1>
            <p className="text-slate-400 text-sm mt-1">Add a new user to the platform. Passwords are hashed on the server.</p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/admin/manage-users")}>Manage Users</Button>
          </div>
        </div>

        {notice && (
          <div className={`mb-6 p-3 rounded flex items-start gap-3 ${notice.type === "success" ? "bg-green-900/30 border border-green-700 text-green-200" : "bg-red-900/30 border border-red-700 text-red-200"}`}>
            {notice.type === "success" ? <CheckCircleIcon className="w-6 h-6 text-green-400" /> : <XCircleIcon className="w-6 h-6 text-red-400" />}
            <div>
              <div className="font-medium">{notice.text}</div>
              {notice.userId && <div className="text-xs text-slate-300 mt-1">User ID: {notice.userId}</div>}
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Full name</label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={onChange}
                disabled={loading}
                className={`w-full px-3 py-2 rounded-md bg-[#071129] border ${errors.fullName ? "border-red-500" : "border-white/10"} text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0b69ff]`}
                placeholder="John Doe"
              />
              {errors.fullName && <div className="text-xs text-red-400 mt-1">{errors.fullName}</div>}
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={onChange}
                disabled={loading}
                className={`w-full px-3 py-2 rounded-md bg-[#071129] border ${errors.email ? "border-red-500" : "border-white/10"} text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0b69ff]`}
                placeholder="user@example.com"
              />
              {errors.email && <div className="text-xs text-red-400 mt-1">{errors.email}</div>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                disabled={loading}
                placeholder="Temporary password"
                className={`w-full px-3 py-2 rounded-md bg-[#071129] border ${errors.password ? "border-red-500" : "border-white/10"} text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0b69ff]`}
              />
              {errors.password && <div className="text-xs text-red-400 mt-1">{errors.password}</div>}
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Phone</label>
              <input
                name="phoneNo"
                value={form.phoneNo}
                onChange={onChange}
                disabled={loading}
                placeholder="9999999999"
                className={`w-full px-3 py-2 rounded-md bg-[#071129] border ${errors.phoneNo ? "border-red-500" : "border-white/10"} text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0b69ff]`}
              />
              {errors.phoneNo && <div className="text-xs text-red-400 mt-1">{errors.phoneNo}</div>}
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={onChange}
              disabled={loading}
              className="w-48 px-3 py-2 rounded-md bg-[#071129] border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0b69ff]"
            >
              <option value="CUSTOMER">Customer</option>
              <option value="MODERATOR">Moderator</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="bg-[#0b69ff] hover:bg-[#095fd8]">
                {loading ? "Creating..." : "Create User"}
              </Button>

              <Button type="button" variant="ghost" disabled={loading} onClick={() => setForm({ fullName: "", email: "", password: "", phoneNo: "", role: "CUSTOMER" })}>
                Reset
              </Button>
            </div>

            <div className="text-xs text-slate-400">Actions are logged for security.</div>
          </div>
        </form>
      </div>
    </div>
  );
}
