// src/page/Watchlist/Watchlist.jsx
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
import { Button } from "@/components/ui/button";
import { BookmarkFilledIcon } from "@radix-ui/react-icons";
import { useDispatch, useSelector } from "react-redux";
import { getUserWatchList, removeItemFromWatchlist } from "@/State/Watchlist/Action";

const fmt = (n) =>
  n == null || Number.isNaN(Number(n))
    ? "-"
    : Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const Watchlist = () => {
  const dispatch = useDispatch();
  // grab whatever is at state.watchlist
  const watchlist = useSelector((s) => s.watchlist);

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) dispatch(getUserWatchList(jwt));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // DEBUG: inspect exactly what comes from Redux
  // Open DevTools Console and look for these logs.
  // Remove logs once fixed.
  // eslint-disable-next-line no-console
  console.log("WATCHLIST (raw from store) ->", watchlist);

  // Resolve coins array from many possible shapes
  const coinsArray = (() => {
    if (!watchlist) return [];
    if (Array.isArray(watchlist.coins)) return watchlist.coins;
    if (Array.isArray(watchlist.items)) return watchlist.items;
    if (Array.isArray(watchlist.data)) return watchlist.data;
    if (Array.isArray(watchlist.payload)) return watchlist.payload;
    // nested shapes
    if (watchlist.watchlist && Array.isArray(watchlist.watchlist.coins)) return watchlist.watchlist.coins;
    if (watchlist.payload && Array.isArray(watchlist.payload.coins)) return watchlist.payload.coins;
    // sometimes the API returns { data: { coins: [...] } }
    if (watchlist.data && Array.isArray(watchlist.data.coins)) return watchlist.data.coins;
    // fallback to empty
    return [];
  })();

  // DEBUG: show what we will render
  // eslint-disable-next-line no-console
  console.log("WATCHLIST -> resolved coinsArray ->", coinsArray);

  const handleRemoveFromWatchlist = async (coinId) => {
    try {
      const jwt = localStorage.getItem("jwt");
      if (!jwt) {
        console.warn("No JWT, cannot remove");
        return;
      }
      await dispatch(removeItemFromWatchlist({ coinId, jwt }));
      await dispatch(getUserWatchList(jwt));
    } catch (err) {
      console.error("Failed to remove from watchlist:", err);
    }
  };

  return (
    <div>
      <div className="p-5 lg:px-20 py-6">
        <h1 className="font-bold text-3xl pt-3 sticky right-0">Watchlist</h1>

        <div className="overflow-x-auto rounded-lg bg-white/0">
          <Table className="border min-w-full table-auto">
            <TableHeader>
              <TableRow className="sticky top-0">
                <TableHead className="py-3 px-4 text-left">Coin</TableHead>
                <TableHead className="py-3 px-4 text-left">Symbol</TableHead>
                <TableHead className="py-3 px-4 text-left">Volume</TableHead>
                <TableHead className="py-3 px-4 text-left">Market Cap</TableHead>
                <TableHead className="py-3 px-4 text-left">24h</TableHead>
                <TableHead className="py-3 px-4 text-right">Price</TableHead>
                <TableHead className="py-3 px-4 text-right">Remove</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {coinsArray.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                    No coins in watchlist.
                  </TableCell>
                </TableRow>
              ) : (
                coinsArray.map((item, idx) => {
                  // item might be a coin object OR a wrapper { coin: {...} }
                  const coin = item.coin ?? item;
                  const id = coin.id ?? item.id ?? idx;
                  const name = coin.name ?? coin.fullName ?? "Unknown";
                  const image = coin.image ?? coin.thumb ?? coin.logo ?? null;
                  const symbol = (coin.symbol ?? "").toUpperCase();
                  const price =
                    coin.current_price ??
                    coin.price ??
                    coin.market_data?.current_price?.usd ??
                    item.price ??
                    null;
                  const marketCap = coin.market_cap ?? item.marketCap ?? null;
                  const volume = coin.total_volume ?? item.volume ?? null;
                  const change24 = coin.price_change_percentage_24h ?? item.change24h ?? null;

                  return (
                    <TableRow key={id} className="h-14">
                      <TableCell className="font-medium flex items-center gap-3 py-3 px-4">
                        <Avatar className="h-8 w-8">
                          {image ? (
                            <AvatarImage src={image} alt={symbol} />
                          ) : (
                            <AvatarFallback>{symbol?.[0] ?? "?"}</AvatarFallback>
                          )}
                        </Avatar>
                        <span>{name}</span>
                      </TableCell>

                      <TableCell className="py-3 px-4">{symbol || "-"}</TableCell>
                      <TableCell className="py-3 px-4">{fmt(volume)}</TableCell>
                      <TableCell className="py-3 px-4">{fmt(marketCap)}</TableCell>
                      <TableCell className={`py-3 px-4 ${change24 >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {change24 != null ? `${fmt(change24)}%` : "-"}
                      </TableCell>
                      <TableCell className="text-right py-3 px-4">
                        {price ? fmt(price) : "-"}
                      </TableCell>

                      <TableCell className="text-right py-3 px-4">
                        <Button variant="ghost" onClick={() => handleRemoveFromWatchlist(coin.id ?? id)} size="icon" className='h-10 w-10'>
                          <BookmarkFilledIcon className="w-6 h-6" />
                        </Button>
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

export default Watchlist;
