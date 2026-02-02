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
import { getUserAssets } from "@/State/Asset/Action";

/**
 * Portfolio (debug-friendly)
 * - Attempts to find the user's assets array across a few possible keys.
 * - Logs `asset` to console so you can inspect the exact shape coming from Redux.
 */
const Portfolio = () => {
  const dispatch = useDispatch();
  const { asset } = useSelector((store) => store);

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) dispatch(getUserAssets(jwt));
  }, [dispatch]);

  // ---- DEBUG: show the entire asset object in console ----
  // Look in DevTools Console for "DEBUG asset ->"
  // This will show you exactly what Redux state contains at render time.
  // Remove this console.log once you fix the issue.
  // eslint-disable-next-line no-console
  console.log("DEBUG asset ->", asset);
  
  // ---- Try multiple possible keys that may contain the array ----
  const userAssets =
    asset.userAssets ?? // typical
    asset?.user_assets ??
    asset?.data ??
    asset?.assets ??
    asset?.payload ??
    [];

  return (
    <div className="p-5 lg:px-20 py-6">
      <h1 className="font-bold text-3xl pt-3 sticky right-0">Portfolio</h1>

      

      <div className="overflow-x-auto rounded-lg bg-white/0">
        <Table className="min-w-full table-auto">
          <TableHeader>
            <TableRow className="sticky top-0">
              <TableHead className="py-3 px-4 text-left">Asset</TableHead>
              <TableHead className="py-3 px-4 text-left">Price</TableHead>
              <TableHead className="py-3 px-4 text-left">Quantity</TableHead>
              <TableHead className="py-3 px-4 text-left">Buy Price</TableHead>
              <TableHead className="py-3 px-4 text-left">P&L%</TableHead>
              <TableHead className="py-3 px-4 text-right">Total Value</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {(!userAssets || userAssets.length === 0) ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                  No assets found.
                </TableCell>
              </TableRow>
            ) : (
              userAssets.map((item, index) => {
                const qty = Number(item.quantity ?? 0);
                const buyPrice = Number(item.buyPrice ?? 0);
                const coin = item.coin ?? {};
                const symbol = (coin.symbol ?? "").toUpperCase();
                const name = coin.name ?? "Unknown";
                const image = coin.image ?? null;
                const currentPrice = Number(coin.current_price ?? coin?.market_data?.current_price?.usd ?? 0);
                const totalValue = qty * currentPrice;
                const plPct = buyPrice > 0 ? ((currentPrice - buyPrice) / buyPrice) * 100 : 0;
                const formattedQty = qty.toFixed(5).replace(/\.?0+$/, "");

                return (
                  <TableRow
                    key={item.id ?? index}
                    className="h-14 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition"
                  >
                    <TableCell className="font-medium flex items-center gap-3 py-3 px-4">
                      <Avatar className="h-8 w-8">
                        {image ? (
                          <AvatarImage src={image} alt={symbol} />
                        ) : (
                          <AvatarFallback>{symbol?.[0] ?? "A"}</AvatarFallback>
                        )}
                      </Avatar>

                      <div>
                        <div className="font-medium">{symbol || name}</div>
                        <div className="text-sm text-gray-500">{name}</div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3 px-4">
                      {currentPrice
                        ? Number(currentPrice).toLocaleString("en-IN", {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 2,
                          })
                        : "—"}
                    </TableCell>

                    <TableCell className="py-3 px-4">{formattedQty}</TableCell>

                    <TableCell className="py-3 px-4">
                      {buyPrice
                        ? Number(buyPrice).toLocaleString("en-IN", {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 2,
                          })
                        : "—"}
                    </TableCell>

                    <TableCell className={`py-3 px-4 ${plPct >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {plPct >= 0 ? "+" : ""}
                      {plPct.toFixed(2)}%
                    </TableCell>

                    <TableCell className="text-right py-3 px-4">
                      {totalValue
                        ? Number(totalValue).toLocaleString("en-IN", {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 2,
                          })
                        : "—"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Portfolio;
