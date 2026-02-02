import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrders } from "@/State/Admin/orders";

export default function AdminOrders(){
  const dispatch = useDispatch();
  const { items, loading } = useSelector(s => s.adminOrders ?? { items: [] });

  useEffect(() => {
    const jwt = localStorage.getItem("admin_jwt");
    if(jwt) dispatch(fetchAllOrders(jwt));
  }, [dispatch]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      {loading && <div>Loading...</div>}
      <div className="space-y-2">
        {items.map(o => (
          <div key={o.id} className="border p-3 rounded flex justify-between">
            <div>
              <div className="font-semibold">#{o.id} — {o.ordertype}</div>
              <div className="text-sm text-gray-500">{o.user?.fullName ?? o.user?.email}</div>
            </div>
            <div className="text-right">
              <div>{o.price}</div>
              <div className="text-xs text-gray-500">{new Date(o.timestamp).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
