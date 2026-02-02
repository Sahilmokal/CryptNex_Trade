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
import { getWithdrawalHistory } from "@/State/Withdrawal/Action";

/**
 * Withdrawal table — includes PENDING requests and completed ones.
 * Defensive: reads from several possible places in the `withdrawal` slice,
 * normalizes rows and sorts them by date (newest first).
 */
const Withdrawal = () => {
  const dispatch = useDispatch();
  const { wallet, withdrawal } = useSelector((store) => store);

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) dispatch(getWithdrawalHistory({ jwt }));
  }, [dispatch]);

  // Collect potential arrays from slice (many names we've seen)
  const candidates = [
    withdrawal?.history,
    withdrawal?.requests,
    withdrawal?.withdrwal, // your reducer sometimes uses this
    withdrawal?.withdrawals,
    withdrawal?.list,
  ];

  // flatten non-null arrays
  const rowsRaw = candidates.reduce((acc, arr) => {
    if (Array.isArray(arr) && arr.length) acc.push(...arr);
    return acc;
  }, []);

  // If nothing found above, maybe the slice directly stores a single request object
  if (!rowsRaw.length) {
    // try single object fields
    const maybe = [
      withdrawal?.paymentDetails,
      withdrawal?.paymentDetail,
      withdrawal?.withdrwal,
      withdrawal?.withdrawal,
    ];
    maybe.forEach((m) => {
      if (m && typeof m === "object" && (m.id || m.amount)) rowsRaw.push(m);
    });
  }

  // normalize rows to a consistent shape and filter duplicates by id + date
  const normalize = (item, idxFallback) => {
    // try common fields first
    const id = item?.id ?? item?.transactionId ?? item?.txId ?? `r-${idxFallback}`;
    const date = item?.date ?? item?.createdAt ?? item?.created_at ?? item?.timestamp ?? null;
    const method =
      item?.method ??
      item?.paymentMethod ??
      item?.channel ??
      (item?.bankName ? `${item.bankName}` : "Bank Transfer");
    const amount =
      item?.amount ??
      item?.value ??
      item?.txAmount ??
      item?.withdrawAmount ??
      item?.requestedAmount ??
      0;
    const currency = item?.currency ?? item?.currencyCode ?? "USD";
    const status = (item?.status ?? item?.state ?? item?.withdrawalStatus ?? "PENDING").toString().toUpperCase();

    return { raw: item, id, date, method, amount, currency, status };
  };

  const normalized = rowsRaw.map((r, i) => normalize(r, i));

  // dedupe by id+date, keep first
  const seen = new Set();
  const deduped = [];
  for (const r of normalized) {
    const key = `${r.id}::${r.date ?? ""}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(r);
    }
  }

  // sort by date descending (newest first). Items without date go to bottom.
  deduped.sort((a, b) => {
    const ta = a.date ? new Date(a.date).getTime() : -Infinity;
    const tb = b.date ? new Date(b.date).getTime() : -Infinity;
    return tb - ta;
  });

  const fmtDate = (raw) => {
    if (!raw) return "—";
    try {
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return String(raw);
      return d.toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(raw);
    }
  };

  const fmtAmount = (amt, currency = "USD") => {
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: currency || "USD",
        maximumFractionDigits: 2,
      }).format(Number(amt ?? 0));
    } catch {
      return String(amt ?? 0);
    }
  };

  const statusBadge = (s) => {
    const st = String(s ?? "PENDING").toUpperCase();
    if (st === "SUCCESS" || st === "COMPLETED" || st === "APPROVED") {
      return <span className="text-sm font-semibold text-green-600">{st}</span>;
    }
    if (st === "PENDING" || st === "REQUESTED") {
      return <span className="text-sm font-semibold text-yellow-600">{st}</span>;
    }
    if (st === "REJECTED" || st === "FAILED" || st === "CANCELLED") {
      return <span className="text-sm font-semibold text-red-600">{st}</span>;
    }
    return <span className="text-sm font-semibold text-gray-600">{st}</span>;
  };

  return (
    <div className="p-5 lg:px-20 py-6">
      <h1 className="font-bold text-3xl pt-3 sticky right-0 pb-3">Withdrawal</h1>

      <div className="overflow-x-auto rounded-lg bg-white/0">
        <Table className="border min-w-full table-auto">
          <TableHeader>
            <TableRow className="sticky top-0 bg-white/80">
              <TableHead className="py-3 px-4 text-left">Date</TableHead>
              <TableHead className="py-3 px-4 text-left">Method</TableHead>
              <TableHead className="py-3 px-4 text-left">Amount</TableHead>
              <TableHead className="py-3 px-4 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {deduped.length ? (
              deduped.map((row) => (
                <TableRow key={row.id} className="h-14">
                  <TableCell className="py-3 px-4">
                    <p>{fmtDate(row.date)}</p>
                  </TableCell>

                  <TableCell className="font-medium flex items-center gap-3 py-3 px-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://cdn-icons-png.flaticon.com/128/1490/1490849.png" />
                      <AvatarFallback>{(row.method && row.method[0]) || "B"}</AvatarFallback>
                    </Avatar>
                    <span>{row.method}</span>
                  </TableCell>

                  <TableCell className="py-3 px-4">{fmtAmount(row.amount, row.currency)}</TableCell>

                  <TableCell className="text-right py-3 px-4">{statusBadge(row.status)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-sm text-gray-400">
                  No withdrawals found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Withdrawal;
