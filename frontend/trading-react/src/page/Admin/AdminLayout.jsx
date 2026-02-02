// src/page/Admin/AdminLayout.jsx
import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Bars3Icon,
  XMarkIcon,
  UsersIcon,
  BanknotesIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PlusIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";

const sidebarItems = [
  { to: "/admin", label: "Dashboard", icon: ChartBarIcon },
  { to: "/admin/manage-users", label: "Manage Users", icon: CheckBadgeIcon },
  { to: "/admin/withdrawals", label: "Withdrawal Pending", icon: BanknotesIcon },
  { to: "/admin/transactions", label: "Transactions", icon: DocumentTextIcon },
  { to: "/admin/reports", label: "Reports", icon: ChartBarIcon },
  // Logout is handled specially when rendering
  { to: "/admin/logout", label: "Logout", icon: XMarkIcon },
];

export default function AdminLayout() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const expandedWidth = 260;
  const collapsedWidth = 70;
  const headerHeight = 64;
  const sidebarHeight = `calc(100vh - ${headerHeight}px)`;

  function handleLogout() {
    // Basic logout: clear auth and redirect to login
    try {
      localStorage.removeItem("jwt");
      localStorage.removeItem("userName");
      localStorage.removeItem("name");
    } catch (e) {
      // ignore
    }

    // Programmatic navigation + hard redirect to ensure app state resets
    navigate("/login");
    setTimeout(() => {
      window.location.href = "/login";
    }, 50);
  }

  const rawName = localStorage.getItem("userName") || localStorage.getItem("name") || "U";
  const profileInitial = (rawName && rawName.length ? rawName[0].toUpperCase() : "U");

  return (
    <div className="min-h-screen bg-[#0f1724] text-white antialiased">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-[#071129] to-[#061426] border-b border-[#0b1220] z-40 flex items-center px-4 justify-between">
        <div className="flex items-center gap-4">
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="p-2.5 rounded hover:bg-white/6 focus:outline-none transition"
          >
            {open ? <XMarkIcon className="w-6 h-6 text-white" /> : <Bars3Icon className="w-6 h-6 text-white" />}
          </button>

          <div className="flex items-center gap-3">
            <div className="text-lg font-semibold tracking-tight">CryptNex Admin</div>
            <span className="hidden md:inline text-sm text-slate-300">— Manage platform</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
  {/* Static Profile Icon — NOT clickable */}
  <div
    title="Profile"
    className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-lg font-semibold text-white cursor-default select-none"
  >
    <UsersIcon className="w-5 h-5 text-white" />
  </div>
</div>

      </header>

      {/* Layout */}
      <div className="pt-16 flex">
        {/* Sidebar */}
        <aside
          className="bg-[#071129] border-r border-[#0b1220] transition-all duration-200 ease-in-out fixed top-16 left-0 z-30"
          style={{
            width: open ? expandedWidth : collapsedWidth,
            height: sidebarHeight,
            overflow: "hidden",
          }}
        >
          <div className="p-4 flex flex-col h-full justify-between" style={{ gap: 12 }}>
            {/* Quick Actions */}
            <div>
              <div className={`${open ? "block" : "hidden"} mb-4`}>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-200">Quick Actions</h4>
                  <button className="text-xs px-2.5 py-1 rounded bg-white/5 hover:bg-white/10">New</button>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2.5">
                  <button
                    onClick={() => navigate("/admin/create-user")}
                    className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/5 text-sm text-slate-100 w-full text-left transition"
                  >
                    <PlusIcon className="w-4 h-4 text-[#60a5fa]" />
                    Create User
                  </button>

                  <button
                    onClick={() => navigate("/admin/withdrawals")}
                    className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/5 text-sm text-slate-100 w-full text-left transition"
                  >
                    <CheckBadgeIcon className="w-4 h-4 text-[#7c3aed]" />
                    Approve Withdrawal
                  </button>
                </div>
              </div>

              {/* Nav */}
              <nav className="flex-1 overflow-hidden">
                <ul className="space-y-1.5">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    // render Logout as a button that triggers handleLogout
                    if (item.label === "Logout") {
                      return (
                        <li key="logout">
                          <button
                            onClick={handleLogout}
                            className={`flex items-center gap-3 py-2 px-3 rounded-md text-sm transition-colors text-slate-200 hover:bg-white/5 w-full text-left`}
                          >
                            <Icon className="w-5 h-5 flex-shrink-0 text-slate-200" />
                            {open && <span className="truncate">{item.label}</span>}
                          </button>
                        </li>
                      );
                    }

                    return (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          end
                          className={({ isActive }) =>
                            `flex items-center gap-3 py-2 px-3 rounded-md text-sm transition-colors ${
                              isActive
                                ? "bg-gradient-to-r from-[#0747a6] to-[#0ea5e9] text-white font-semibold shadow-md"
                                : "text-slate-200 hover:bg-white/5"
                            }`
                          }
                        >
                          <Icon className="w-5 h-5 flex-shrink-0 text-slate-200" />
                          {open && <span className="truncate">{item.label}</span>}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            {/* Bottom actions */}
            <div className="mt-4 border-t border-white/10 pt-3">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate("/admin/withdrawals")}
                  className="flex items-center gap-3 py-2 px-3 rounded hover:bg-white/10 w-full text-left text-sm"
                >
                  <BanknotesIcon className="w-5 h-5 text-[#60a5fa]" />
                  {open && "Approve Withdrawals"}
                </button>

                <button
                  onClick={() => navigate("/admin/manage-users")}
                  className="flex items-center gap-3 py-2 px-3 rounded hover:bg-white/10 w-full text-left text-sm"
                >
                  <UsersIcon className="w-5 h-5 text-[#60a5fa]" />
                  {open && "Manage Users"}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content (NO inner wrapper - Outlet fills the right area) */}
        <main
          className="flex-1 transition-all duration-200"
          style={{ marginLeft: open ? expandedWidth : collapsedWidth }}
        >
          {/* Remove inner padding/wrapper so child (Outlet) can fill full width */}
          <div className="w-full min-h-[60vh]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
