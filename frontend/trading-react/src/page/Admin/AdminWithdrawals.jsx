// src/page/Admin/AdminWithdrawals.jsx
import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function AdminWithdrawals() {
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null); // id currently processing
  const [notice, setNotice] = useState(null); // global inline notice (top of page)
  const [toast, setToast] = useState(null); // right-top toast {type,text}
  const toastTimer = useRef(null);

  const LIST_URL = "http://localhost:5454/api/admin/withdrawal";
  const ACTION_URL_BASE = "http://localhost:5454/api/admin/withdrawal";

  async function loadWithdrawals() {
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
        setWithdrawals([]);
        setNotice({ type: "error", text: data?.message || "Failed to load withdrawal requests" });
      } else {
        setWithdrawals(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setWithdrawals([]);
      setNotice({ type: "error", text: err.message || "Network error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWithdrawals();
    // cleanup toast timer on unmount
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  // Only pending (defensive)
  const pendingWithdrawals = withdrawals.filter((w) => {
    const s = (w.status ?? "").toString().toUpperCase();
    return s === "PENDING" || s === "0";
  });

  // show toast (auto dismiss)
  function showToast(t) {
    setToast(t);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }

  // update a single withdrawal item in-place (merge fields from server)
  function updateWithdrawalInList(updated) {
    setWithdrawals((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
  }

  async function handleAction(id, accept) {
    setNotice(null);
    setActionLoadingId(id);

    // optimistic UI: mark this row as processing so actions disable immediately
    setWithdrawals((prev) => prev.map((w) => (w.id === id ? { ...w, _processing: true } : w)));

    try {
      const token = localStorage.getItem("jwt");
      const url = `${ACTION_URL_BASE}/${id}/proceed/${accept}`;

      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      // try parse JSON (if backend returns empty body we tolerate)
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data?.message || `Action failed (${res.status})`;
        setNotice({ type: "error", text: msg });
        showToast({ type: "error", text: msg });
        // remove optimistic processing flag so actions reappear
        setWithdrawals((prev) => prev.map((w) => (w.id === id ? { ...w, _processing: false } : w)));
      } else {
        // success: server returns updated withdrawal object — use it if available, otherwise reload list
        const successText = accept ? "Withdrawal approved successfully" : "Withdrawal rejected";
        setNotice({ type: "success", text: successText });
        showToast({ type: "success", text: successText });

        if (data && data.id) {
          // backend returned the updated withdrawal — update single row
          updateWithdrawalInList(data);
        } else {
          // fallback: refresh full list
          await loadWithdrawals();
        }
      }
    } catch (err) {
      const errMsg = err?.message || "Network error";
      setNotice({ type: "error", text: errMsg });
      showToast({ type: "error", text: errMsg });
      setWithdrawals((prev) => prev.map((w) => (w.id === id ? { ...w, _processing: false } : w)));
    } finally {
      setActionLoadingId(null);
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleString();
  }

  return (
    <div className="w-full text-white relative">
      {/* Toast (top-right) */}
      {toast && (
        <div className="fixed top-5 right-5 z-50">
          <div
            className={`px-4 py-2 rounded shadow-md ${
              toast.type === "success" ? "bg-green-700 text-white" : "bg-red-700 text-white"
            }`}
          >
            {toast.text}
          </div>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Pending Withdrawals</h1>
            <p className="text-slate-400 text-sm mt-1">Review and approve or reject PENDING withdrawal requests.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-white/20 text-white" onClick={loadWithdrawals} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </Button>

            <Button variant="ghost" onClick={() => navigate("/admin/transactions")}>
              View Processed
            </Button>
          </div>
        </div>

        {/* Notice (inline) */}
        {notice && (
          <div
            className={`mb-4 p-3 rounded text-sm ${
              notice.type === "success"
                ? "bg-green-900/30 border border-green-700 text-green-200"
                : "bg-red-900/30 border border-red-700 text-red-200"
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
                <th className="py-2 px-3">Requested At</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-slate-300">
                    Loading withdrawal requests...
                  </td>
                </tr>
              )}

              {!loading && pendingWithdrawals.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-slate-400">
                    No pending withdrawal requests.
                  </td>
                </tr>
              )}

              {!loading &&
                pendingWithdrawals.map((w) => {
                  const isProcessing = !!w._processing || actionLoadingId === w.id;
                  return (
                    <tr key={w.id} className="border-t border-white/5 hover:bg-white/5 transition">
                      <td className="py-3 px-3 text-slate-200">{w.id}</td>
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span>{w.user?.fullName || w.user?.email || "—"}</span>
                          {w.user?.email && <span className="text-xs text-slate-400">{w.user.email}</span>}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-100">₹{w.amount}</td>
                      <td className="py-3 px-3 text-slate-300">{formatDate(w.date)}</td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isProcessing ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/5 text-xs text-slate-200">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                              </svg>
                              Processing...
                            </div>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white text-xs px-3"
                                disabled={actionLoadingId !== null}
                                onClick={() => handleAction(w.id, true)}
                              >
                                Approve
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-300 hover:text-red-200 hover:bg-red-900/40 text-xs px-3"
                                disabled={actionLoadingId !== null}
                                onClick={() => handleAction(w.id, false)}
                              >
                                Reject
                              </Button>
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
      </div>
    </div>
  );
}
