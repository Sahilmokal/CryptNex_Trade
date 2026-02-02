import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import * as ScrollArea from "@radix-ui/react-scroll-area";

const AssetTable = ({ coin = [], category }) => {
  const navigate = useNavigate();

  return (
    <div className="w-full overflow-hidden"> 
      <ScrollArea.Root
        className={`${category === "all" ? "h-[74vh]" : "h-[82vh]"} overflow-hidden`}
      >
        <ScrollArea.Viewport className="w-full h-full overflow-y-auto overflow-x-hidden">
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[28%]">Coin</TableHead>
                <TableHead className="w-[10%]">Symbol</TableHead>
                <TableHead className="w-[15%]">Volume</TableHead>
                <TableHead className="w-[20%]">Market Cap</TableHead>
                <TableHead className="w-[10%]">24h</TableHead>
                <TableHead className="w-[17%] text-right">Price</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {coin.map((item) => (
                <TableRow key={item.id}>
                  <TableCell
                    className="w-[28%] overflow-hidden"
                    onClick={() => navigate(`/market/${item.id}/`)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar>
                        <AvatarImage src={item.image} />
                        <AvatarFallback>{(item.name || "N").charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="truncate">{item.name}</span>
                    </div>
                  </TableCell>

                  <TableCell className="w-[10%] font-semibold whitespace-nowrap">
                    {item.symbol}
                  </TableCell>

                  <TableCell className="w-[15%] truncate whitespace-nowrap">
                    {item.total_volume}
                  </TableCell>

                  <TableCell className="w-[20%] truncate whitespace-nowrap">
                    {item.market_cap}
                  </TableCell>

                  <TableCell
                    className={`w-[10%] whitespace-nowrap ${
                      item.price_change_percentage_24h >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {item.price_change_percentage_24h}%
                  </TableCell>

                  <TableCell className="w-[17%] text-right whitespace-nowrap truncate">
                    {item.current_price}$
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea.Viewport>

        {/* Optional visible scrollbar */}
        <ScrollArea.Scrollbar orientation="vertical" className="bg-gray-200 w-2">
          <ScrollArea.Thumb className="bg-gray-600 rounded-full" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </div>
  );
};

export default AssetTable;
