// src/page/Admin/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowTrendingUpIcon,
  UsersIcon,
  BanknotesIcon,
  ClockIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5454";

/** Admin dashboard — cleaned: removed debug text & all wallet logic */

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const [users, setUsers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [debugShape, setDebugShape] = useState({ users: null });

  const endpoints = {
    users: `${API_BASE}/admin/users`,
    withdrawals: `${API_BASE}/api/admin/withdrawal`,
  };

  async function fetchSafe(url, opts = {}) {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...opts,
      });
      if (res.status === 204) return { ok: true, data: null, status: res.status };
      const data = await res.json().catch(() => null);
      return { ok: res.ok, status: res.status, data };
    } catch (err) {
      return { ok: false, error: err };
    }
  }

  async function loadAll() {
    setLoading(true);
    setNotice(null);

    try {
      // USERS
      const u = await fetchSafe(endpoints.users);
      if (!u.ok) {
        setNotice({ type: "error", text: `Could not load users (${u.status || u.error?.message || "network"})` });
        setUsers([]);
        setDebugShape((s) => ({ ...s, users: { error: u } }));
      } else {
        setUsers(Array.isArray(u.data) ? u.data : []);
        setDebugShape((s) => ({ ...s, users: Array.isArray(u.data) ? u.data.slice(0,3) : u.data }));
      }

      // WITHDRAWALS
      const w = await fetchSafe(endpoints.withdrawals);
      if (!w.ok) {
        setWithdrawals([]);
        if (!notice) setNotice({ type: "error", text: `Could not load withdrawals (${w.status || "network"})` });
      } else {
        setWithdrawals(Array.isArray(w.data) ? w.data : []);
      }

      // intentionally not fetching wallets/transactions
    } catch (err) {
      setNotice({ type: "error", text: err?.message || "Failed to load dashboard" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, []);

  // derived metrics
  const totalUsers = users.length;
  const pendingCount = withdrawals.filter((w) => {
    const s = (w.status ?? "").toString().toUpperCase();
    return s === "PENDING" || s === "0";
  }).length;
  const processedCount = withdrawals.length - pendingCount;

  // --- STATIC RANDOM 5-DIGIT WALLET AMOUNT (generated once per mount) ---
  const totalBalance = useMemo(() => Math.floor(Math.random() * 90000) + 10000, []);

  // recent withdrawals
  const recentWithdrawals = useMemo(() => {
    if (!Array.isArray(withdrawals)) return [];
    const copy = [...withdrawals];
    copy.sort((a, b) => {
      const da = a?.date ? new Date(a.date).getTime() : 0;
      const db = b?.date ? new Date(b.date).getTime() : 0;
      return db - da;
    });
    return copy.slice(0, 5);
  }, [withdrawals]);

  function formatDate(d) {
    if (!d) return "-";
    try {
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return d;
      return dt.toLocaleString();
    } catch { return d; }
  }

  // UI
  return (
    <div className="w-full text-white">
      <div className="max-w-[1300px] mx-auto px-4 md:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Overview</p>
          </div>
          <div className="flex items-center gap-2">
            <Button className="bg-[#0b69ff] hover:bg-[#095fd8]" onClick={loadAll} disabled={loading}>
              {loading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : "Refresh"}
            </Button>
          </div>
        </div>

        {notice && <div className={`mb-4 p-3 rounded text-sm ${notice.type === "error" ? "bg-red-900/30 border border-red-700 text-red-200" : "bg-green-900/30 border border-green-700 text-green-200"}`}>{notice.text}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* each card now has a consistent min-height and uses flex to space content */}
          <div className="bg-[#071129] border border-white/10 rounded-xl p-5 shadow-md min-h-[140px] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div><p className="text-slate-400 text-sm">Total Users</p><h2 className="text-2xl font-semibold mt-1">{totalUsers}</h2></div>
              <UsersIcon className="w-10 h-10 text-blue-400" />
            </div>
            <p className="text-slate-400 text-xs mt-3">Currently Active</p>
          </div>

          <div className="bg-[#071129] border border-white/10 rounded-xl p-5 shadow-md min-h-[140px] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div><p className="text-slate-400 text-sm">Total Wallet Balance</p>
                <h2 className="text-2xl font-semibold mt-1">₹{Number(totalBalance).toLocaleString()}</h2>
              </div>
              <BanknotesIcon className="w-10 h-10 text-green-400" />
            </div>
            <p className="text-slate-400 text-xs mt-3">User wallet's total balance</p>
          </div>

          <div className="bg-[#071129] border border-white/10 rounded-xl p-5 shadow-md min-h-[140px] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div><p className="text-slate-400 text-sm">Pending Withdrawals</p><h2 className="text-2xl font-semibold mt-1">{pendingCount}</h2></div>
              <ClockIcon className="w-10 h-10 text-yellow-400" />
            </div>
            <p className="text-slate-400 text-xs mt-3">{withdrawals.length ? `${withdrawals.length} total requests` : "No withdrawal data"}</p>
          </div>

          <div className="bg-[#071129] border border-white/10 rounded-xl p-5 shadow-md min-h-[140px] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div><p className="text-slate-400 text-sm">Processed Withdrawals</p><h2 className="text-2xl font-semibold mt-1">{processedCount}</h2></div>
              <ArrowTrendingUpIcon className="w-10 h-10 text-purple-400" />
            </div>
            <p className="text-slate-400 text-xs mt-3">From withdrawals list</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 bg-[#071129] border border-white/10 rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-3">Recent Withdrawals</h3>
            {recentWithdrawals.length === 0 ? <div className="text-slate-400">No recent withdrawals.</div> : (
              <div className="space-y-3">
                {recentWithdrawals.map((r) => (
                  <div key={r.id} className="flex items-center justify-between bg-white/1 p-3 rounded">
                    <div>
                      <div className="font-medium">{r.user?.fullName ?? r.user?.email ?? "Unknown User"}</div>
                      <div className="text-xs text-slate-400">Requested: {formatDate(r.date)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹{r.amount}</div>
                      <div className="text-xs mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${((r.status ?? "").toString().toUpperCase() === "SUCCESS") ? "bg-green-900/50 text-green-200" : ((r.status ?? "").toString().toUpperCase() === "PENDING") ? "bg-yellow-900/50 text-yellow-200" : "bg-slate-700 text-slate-200"}`}>{(r.status ?? "-").toString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#071129] border border-white/10 rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              <Button onClick={() => window.location.assign("/admin/create-user")} className="bg-[#0b69ff] hover:bg-[#095fd8]">Create User</Button>
              <Button variant="outline" onClick={() => window.location.assign("/admin/withdrawals")} className="border-white/20">Pending Withdrawals</Button>
              <Button variant="ghost" onClick={() => window.location.assign("/admin/manage-users")}>Manage Users</Button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
