import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers } from "@/State/Admin/users";

export default function AdminUsers(){
  const dispatch = useDispatch();
  const { items } = useSelector(s => s.adminUsers ?? { items: [] });

  useEffect(() => {
    const jwt = localStorage.getItem("admin_jwt");
    if (jwt) dispatch(fetchAllUsers(jwt));
  }, [dispatch]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <div className="space-y-2">
        {items.map(u=>(
          <div key={u.id} className="flex justify-between border p-3 rounded">
            <div>
              <div className="font-semibold">{u.fullName ?? u.email}</div>
              <div className="text-sm text-gray-500">{u.email}</div>
            </div>
            <div>{u.userRole ?? "-"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
