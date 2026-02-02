// src/page/Admin/AdminWithdrawalTransactions.jsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function AdminWithdrawalTransactions() {
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const LIST_URL = "http://localhost:5454/api/admin/withdrawal";

  async function loadProcessed() {
    setLoading(true);
    setNotice(null);

    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(LIST_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json().catch(() => []);
      if (!res.ok) {
        setNotice({ type: "error", text: data?.message || "Failed to load withdrawals" });
        setWithdrawals([]);
      } else {
        const arr = Array.isArray(data) ? data : [];

        // debug: list all unique statuses returned by backend
        try {
          const statuses = Array.from(new Set(arr.map((w) => String(w.status).toUpperCase())));
          // eslint-disable-next-line no-console
          console.log("withdrawal statuses from backend:", statuses);
        } catch (e) {
          // ignore
        }

        // Show everything except explicit PENDING entries.
        // This is defensive and will show numeric enums, "REJECTED", "DECLINED", etc.
        const processed = arr.filter((w) => {
          const s = String(w.status ?? "").toUpperCase();
          return s !== "PENDING";
        });

        setWithdrawals(processed);
      }
    } catch (err) {
      setNotice({ type: "error", text: err.message || "Network error" });
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProcessed();
  }, []);

  function fmtDate(d) {
    if (!d) return "-";
    const dd = new Date(d);
    return isNaN(dd.getTime()) ? d : dd.toLocaleString();
  }

  return (
    <div className="w-full text-white">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Processed Withdrawals</h1>
            <p className="text-slate-400 text-sm mt-1">
              These withdrawals have already been approved or declined.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/admin/withdrawals")}>
              View Pending
            </Button>

            <Button
              variant="outline"
              className="border-white/20 text-white"
              onClick={loadProcessed}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Notice */}
        {notice && (
          <div
            className={`mb-4 p-3 rounded text-sm ${
              notice.type === "error"
                ? "bg-red-900/30 border border-red-700 text-red-200"
                : "bg-green-900/30 border border-green-700 text-green-200"
            }`}
          >
            {notice.text}
          </div>
        )}

        {/* Table */}
        <div className="bg-[#071129] border border-white/10 rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-200">
              <tr>
                <th className="py-2 px-3">ID</th>
                <th className="py-2 px-3">User</th>
                <th className="py-2 px-3">Amount</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Processed At</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-slate-300">
                    Loading...
                  </td>
                </tr>
              )}

              {!loading && withdrawals.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-slate-400">
                    No processed withdrawals found.
                  </td>
                </tr>
              )}

              {!loading &&
                withdrawals.map((w) => {
                  const status = String(w.status ?? "").toUpperCase();
                  return (
                    <tr key={w.id} className="border-t border-white/5 hover:bg-white/5 transition">
                      <td className="py-3 px-3 text-slate-300">{w.id}</td>

                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span>{w.user?.fullName || "—"}</span>
                          {w.user?.email && <span className="text-xs text-slate-400">{w.user.email}</span>}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-100">₹{w.amount}</td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            status === "SUCCESS" ? "bg-green-900/50 text-green-200" : "bg-red-900/50 text-red-200"
                          }`}
                        >
                          {status || "—"}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-300">{fmtDate(w.date)}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
