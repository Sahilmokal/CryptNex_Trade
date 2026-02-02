import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const user = useSelector((s) => s.auth?.user);

  if (!user) return <Navigate to="/admin/login" replace />;

  const role = user.userRole ?? user.user_role ?? user.role;
  const isAdmin = role === "ROLE_ADMIN" || Number(role) === 0 || Number(role) === 2;

  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  return children;
}
