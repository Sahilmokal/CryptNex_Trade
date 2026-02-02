// src/page/Activity/Activity.jsx
import React, { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import { getALLOrdersForUser } from "@/State/Order/Action";

const fmt = (n, opts = {}) => {
  if (n == null || Number.isNaN(Number(n))) return "-";
  const { currency = true, digits = 2 } = opts;
  if (currency) {
    return Number(n).toLocaleString("en-IN", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: digits,
    });
  }
  return Number(n).toLocaleString("en-IN", { maximumFractionDigits: digits });
};

const fmtDate = (iso) => {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    const date = d.toLocaleDateString("en-GB"); // dd/mm/yyyy
    const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    return { date, time };
  } catch {
    return { date: iso, time: "" };
  }
};

const Activity = () => {
  const dispatch = useDispatch();
  // try multiple common locations for orders in state
  const orderState = useSelector((s) => s.order ?? {});
  const orders =
    orderState.allOrders ??
    orderState.orders ??
    orderState.payload ??
    orderState.data ??
    orderState.orderList ??
    [];

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) dispatch(getALLOrdersForUser({ jwt }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  return (
    <div>
      <div className="p-5 lg:px-20 py-6">
        <h1 className="font-bold text-3xl pt-3 sticky right-0 pb-3">Trade History</h1>

        <div className="overflow-x-auto rounded-lg bg-white/0">
          <Table className="border min-w-full table-auto">
            <TableHeader>
              <TableRow className="sticky top-0">
                <TableHead className="py-3 px-4 text-left">Date & Time</TableHead>
                <TableHead className="py-3 px-4 text-left">Pair / Coin</TableHead>
                <TableHead className="py-3 px-4 text-left">Quantity</TableHead>
                <TableHead className="py-3 px-4 text-left">Buy Price</TableHead>
                <TableHead className="py-3 px-4 text-left">Sell Price</TableHead>
                <TableHead className="py-3 px-4 text-left">Order Type</TableHead>
                <TableHead className="py-3 px-4 text-right">P/L</TableHead>
                <TableHead className="py-3 px-4 text-right">Value (USD)</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {(!orders || orders.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                    No trade history.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((o, idx) => {
                  // normalize order object shape (be defensive)
                  const order = o?.order ?? o;
                  const id = order?.id ?? idx;
                  const ts = order?.timestamp ?? order?.date ?? order?.createdAt ?? order?.time;
                  const { date, time } = fmtDate(ts);
                  const orderType = (order?.ordertype ?? order?.orderType ?? "").toUpperCase();

                  // orderItem might be nested
                  const orderItem = order?.orderItem ?? order?.order_item ?? {};
                  const coin = orderItem?.coin ?? order?.coin ?? orderItem?.asset ?? {};
                  const coinName = coin?.name ?? coin?.fullName ?? "Unknown";
                  const symbol = (coin?.symbol ?? (coin?.id ?? "")).toUpperCase();

                  const qty = Number(orderItem?.quantity ?? order?.quantity ?? 0);
                  // buy/sell prices might be in orderItem
                  const buyPrice = Number(orderItem?.buyPrice ?? orderItem?.buy_price ?? order?.buyPrice ?? 0);
                  const sellPrice = Number(orderItem?.sellPrice ?? orderItem?.sell_price ?? order?.sellPrice ?? 0);

                  // order total value might be order.price
                  const orderValue = Number(order?.price ?? order?.value ?? 0);

                  // compute simple P/L if both buy and sell present and qty > 0
                  const pl = (sellPrice && buyPrice && qty)
                    ? (sellPrice - buyPrice) * qty
                    : 0;
                  const plPct = buyPrice > 0 ? ((sellPrice - buyPrice) / buyPrice) * 100 : 0;

                  return (
                    <TableRow key={id} className="h-14">
                      <TableCell className="py-3 px-4">
                        <div>{date}</div>
                        <div className="text-gray-400">{time}</div>
                      </TableCell>

                      <TableCell className="font-medium flex items-center gap-3 py-3 px-4">
                        <Avatar className="h-8 w-8">
                          {coin?.image ? (
                            <AvatarImage src={coin.image} alt={symbol} />
                          ) : (
                            <AvatarFallback>{symbol?.[0] ?? "?"}</AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <div className="font-medium">{symbol}</div>
                          <div className="text-sm text-gray-500">{coinName}</div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 px-4">{qty || "-"}</TableCell>

                      <TableCell className="py-3 px-4">{buyPrice ? fmt(buyPrice) : "-"}</TableCell>
                      <TableCell className="py-3 px-4">{sellPrice ? fmt(sellPrice) : "-"}</TableCell>

                      <TableCell className="py-3 px-4">{orderType || "-"}</TableCell>

                      <TableCell className={`py-3 px-4 text-right ${pl >= 0 ? "text-green-500" : "text-red-500"}`}>
                        { (buyPrice && sellPrice && qty)
                          ? <>
                              <div>{fmt(pl)}</div>
                              <div className="text-xs text-gray-400">{plPct >= 0 ? "+" : ""}{plPct.toFixed(2)}%</div>
                            </>
                          : "-"
                        }
                      </TableCell>

                      <TableCell className="text-right py-3 px-4">
                        {orderValue ? fmt(orderValue) : (qty && sellPrice ? fmt(qty * sellPrice) : "-")}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Activity;
