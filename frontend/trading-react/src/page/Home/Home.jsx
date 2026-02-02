import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import AssetTable from "./AssetTable";
import StockChart from "./StockChart";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { Dot, MessageCircle, X as CrossIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getCoinList,
  getTop50CoinList,
  getTopGainers,
  getTopLosers,
} from "@/State/Coin/Action";
import axios from "axios";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const nf = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const Home = () => {
  const [category, setCategory] = useState("all");
  const dispatch = useDispatch();

  // ✅ always select slice
  const coin = useSelector((state) => state.coin);
  useEffect(() => {
  console.log("📦 Redux state snapshot:", {
    category,
    topLosers: coin.topLosers,
    topGainers: coin.topGainers,
    searchCoinList: coin.searchCoinList,
  });
}, [coin, category]);


  const market = coin?.marketChart || {};

  const chartSymbol = (
    market.symbol ||
    market?.meta?.symbol ||
    market?.ticker ||
    "ETH"
  )
    .toString()
    .toUpperCase();

  const chartName = market.name || market?.meta?.name || "Ethereum";

  const chartPrice =
    market?.last_price ??
    market?.price ??
    market?.close ??
    coin?.coinDetails?.market_data?.current_price?.usd ??
    0;

  const chartChangeRaw =
    market?.change_pct ?? market?.change_percent ?? 0;

  const formattedChartPrice = nf.format(Number(chartPrice));
  const formattedChartChange = `${Number(chartChangeRaw).toFixed(5)}%`;
  const chartChangeIsNegative = Number(chartChangeRaw) < 0;

  /* ---------------- FETCH BASED ON CATEGORY ---------------- */
  useEffect(() => {
    if (category === "all") {
      dispatch(getCoinList(1));
    } else if (category === "top50") {
      dispatch(getTop50CoinList());
    } else if (category === "topGainers") {
      dispatch(getTopGainers());
    } else if (category === "topLosers") {
      dispatch(getTopLosers());
    }
  }, [category, dispatch]);

  /* ---------------- CHATBOT ---------------- */
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, from: "bot", text: "Hi! Ask me about crypto prices or markets." },
  ]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, chatOpen]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const id = Date.now();
    setMessages((m) => [...m, { id, from: "user", text: trimmed }]);
    setInput("");

    try {
      const res = await axios.post("http://localhost:5453/ai/chat", {
        prompt: trimmed,
      });

      setMessages((m) => [
        ...m,
        {
          id: id + 1,
          from: "bot",
          text: res.data?.message || "Sorry, I couldn’t understand that.",
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: id + 1,
          from: "bot",
          text: "⚠️ Server error. Please try again.",
        },
      ]);
    }
  };
useEffect(() => {
  // whenever user switches tab → clear search results
  dispatch({ type: "CLEAR_SEARCH_RESULTS" });
}, [category, dispatch]);

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ---------------- TABLE DATA PRIORITY ---------------- */
const tableData =
  category === "topGainers"
    ? coin.topGainers
    : category === "topLosers"
    ? coin.topLosers
    : category === "top50"
    ? coin.top50
    : coin.searchCoinList?.length > 0
    ? coin.searchCoinList
    : coin.coinList;


  return (
    <div className="relative pt-6">
      <div className="lg:flex">

        {/* LEFT */}
        <div className="lg:w-[50%] lg:border-r">
          <div className="p-3 flex gap-4">
            {["all", "top50", "topGainers", "topLosers"].map((c) => (
              <Button
                key={c}
                onClick={() => setCategory(c)}
                variant={category === c ? "default" : "outline"}
                className="rounded-full"
              >
                {c}
              </Button>
            ))}
          </div>

          <AssetTable coin={tableData || []} category={category} />

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

        {/* RIGHT */}
        <div className="hidden lg:block lg:w-[50%] p-5">
          <StockChart coinId="ethereum" />

          <div className="flex justify-between mt-6">
            <div className="flex gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={market?.image} />
              </Avatar>

              <div>
                <div className="flex gap-2">
                  <p className="font-medium">{chartSymbol}</p>
                  <Dot size={12} />
                  <p className="text-gray-400">{chartName}</p>
                </div>

                <div className="flex gap-2">
                  <p className="text-xl font-bold">3030.83$</p>
                  <p
                    className={
                      chartChangeIsNegative
                        ? "text-red-600"
                        : "text-green-600"
                    }
                  >
                    	3.10957%	
                  </p>
                </div>
              </div>
            </div>

            {/* CHATBOT */}
            <div className="relative">
              {chatOpen && (
                <div className="absolute bottom-[4rem] right-0 w-[25rem] h-[70vh] bg-[#1e293b] text-white flex flex-col border border-blue-700">
                  <div className="flex justify-between p-3 border-b border-blue-600">
                    <p>Chat Bot</p>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setChatOpen(false)}
                    >
                      <CrossIcon />
                    </Button>
                  </div>

                  <div
                    ref={scrollRef}
                    className="flex-1 overflow-auto p-3 space-y-3"
                  >
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={m.from === "user" ? "text-right" : ""}
                      >
                        <div
                          className={`inline-block px-3 py-2 rounded ${
                            m.from === "user"
                              ? "bg-blue-500"
                              : "bg-blue-900"
                          }`}
                        >
                          {m.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-2 border-t border-blue-700">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={onKeyDown}
                      className="w-full p-2 bg-[#0f172a] border border-blue-700"
                      placeholder="Ask about crypto..."
                    />
                    <Button className="mt-2 w-full" onClick={handleSend}>
                      Send
                    </Button>
                  </div>
                </div>
              )}

              <Button onClick={() => setChatOpen(!chatOpen)}>
                <MessageCircle /> {chatOpen ? "Close" : "Chat Bot"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
