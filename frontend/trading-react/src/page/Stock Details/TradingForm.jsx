import React, { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DotIcon } from "@radix-ui/react-icons";
import { useDispatch, useSelector } from "react-redux";
import { getUserWallet } from "@/State/Wallet/Action";
import { getAssetDetails, getUserAssets } from "@/State/Asset/Action";
import { payOrder } from "@/State/Order/Action";

const TradingForm = () => {
  const [orderType, setOrderType] = useState("BUY"); // "BUY" | "SELL"
  const [amount, setAmount] = useState(""); // USD input (BUY)
  const [sellQty, setSellQty] = useState(""); // quantity input (SELL)
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { coin, wallet, asset } = useSelector((store) => store);

  // ---- data helpers ----
  const price = coin?.coinDetails?.market_data?.current_price?.usd;
  const walletBalance = Number(wallet?.userWallet?.balance ?? 0);
  const assetQuantity = Number(asset?.assetDetails?.quantity ?? 0);

  // numeric parse
  const numericAmount = useMemo(() => {
    if (!amount || amount === ".") return NaN;
    const n = parseFloat(amount);
    return Number.isFinite(n) ? n : NaN;
  }, [amount]);

  const numericSellQty = useMemo(() => {
    if (!sellQty || sellQty === ".") return NaN;
    const n = parseFloat(sellQty);
    return Number.isFinite(n) ? n : NaN;
  }, [sellQty]);

  // derived BUY quantity from typed amount
  const buyQtyFromAmount = useMemo(() => {
    if (!price || !Number.isFinite(numericAmount) || numericAmount <= 0) return 0;
    const raw = numericAmount / price;
    return parseFloat(raw.toFixed(8));
  }, [numericAmount, price]);

  // derived SELL amount from typed qty
  const sellAmountFromQty = useMemo(() => {
    if (!price || !Number.isFinite(numericSellQty) || numericSellQty <= 0) return 0;
    const raw = numericSellQty * price;
    return parseFloat(raw.toFixed(8));
  }, [numericSellQty, price]);

  // effective quantity & amount to use for the order
  const effectiveQuantity = orderType === "SELL" ? numericSellQty : buyQtyFromAmount;
  const effectiveAmount = orderType === "BUY" ? numericAmount : sellAmountFromQty;
const formattedAssetQty = assetQuantity.toFixed(5).replace(/\.?0+$/, "");

  // UI strings
  const formattedQuantity = effectiveQuantity ? String(effectiveQuantity) : "0";
  const formattedPrice = price
    ? Number(price).toLocaleString("en-IN", { style: "currency", currency: "USD", maximumFractionDigits: 2 })
    : "—";

  // validation
  const insufficientFunds = orderType === "BUY" && Number.isFinite(numericAmount) && numericAmount > walletBalance;
  const insufficientQty = orderType === "SELL" && Number.isFinite(numericSellQty) && numericSellQty > assetQuantity;
  const disabledAction =
    !price ||
    loading ||
    (orderType === "BUY"
      ? !Number.isFinite(numericAmount) || numericAmount <= 0 || insufficientFunds
      : !Number.isFinite(numericSellQty) || numericSellQty <= 0 || insufficientQty);

  // input handlers
  const handleAmountChange = (e) => {
    const val = e.target.value;
    if (val === "" || /^(\d+(\.\d*)?|\.\d*)$/.test(val)) {
      setAmount(val);
    }
  };

  const handleSellQtyChange = (e) => {
    const val = e.target.value;
    if (val === "" || /^(\d+(\.\d*)?|\.\d*)$/.test(val)) {
      setSellQty(val);
    }
  };

  // place order
  const handlePlaceOrder = async () => {
    if (!price) return console.warn("Price not available");
    if (!localStorage.getItem("jwt")) return console.warn("No JWT");

    if (orderType === "BUY") {
      if (!Number.isFinite(numericAmount) || numericAmount <= 0) return console.warn("Enter valid amount");
      if (insufficientFunds) return console.warn("Insufficient funds");
    } else {
      if (!Number.isFinite(numericSellQty) || numericSellQty <= 0) return console.warn("Enter sell quantity");
      if (insufficientQty) return console.warn("Insufficient asset quantity");
    }

    const jwt = localStorage.getItem("jwt");
    const payload = {
      jwt,
      amount: effectiveAmount,
      orderData: {
        coinId: coin?.coinDetails?.id,
        quantity: effectiveQuantity,
        orderType,
      },
    };

    try {
      setLoading(true);
      // dispatch payOrder and wait for result
      await dispatch(payOrder(payload));

      // refresh data from backend
      dispatch(getUserWallet(jwt));
      dispatch(getUserAssets(jwt));
      if (coin?.coinDetails?.id) {
        dispatch(getAssetDetails({ coinId: coin.coinDetails.id, jwt }));
      }

      // reset inputs after success
      if (orderType === "BUY") setAmount("");
      else setSellQty("");
    } catch (err) {
      console.error("Order failed:", err?.response?.data ?? err?.message ?? err);
    } finally {
      setLoading(false);
    }
  };

  // fetch wallet and asset details on mount / coin change
  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      dispatch(getUserWallet(jwt));
      dispatch(getUserAssets(jwt));
    }
    if (coin?.coinDetails?.id && jwt) {
      dispatch(getAssetDetails({ coinId: coin.coinDetails.id, jwt }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, coin?.coinDetails?.id]);

  return (
    <div className="space-y-10 p-5">
      {/* AMOUNT / SELL QUANTITY + QUANTITY DISPLAY */}
      <div>
        <div className="flex gap-4 items-center justify-between">
          <div className="flex-1 mr-4">
            {orderType === "BUY" ? (
              <>
                <Input
                  className="py-7 focus:outline-none"
                  placeholder={price ? "Enter Amount (USD)..." : "Price not available"}
                  onChange={handleAmountChange}
                  type="text"
                  value={amount}
                  disabled={!price || loading}
                />
                
              </>
            ) : (
              <>
                <Input
                  className="py-7 focus:outline-none"
                  placeholder={price ? "Enter quantity to sell..." : "Price not available"}
                  onChange={handleSellQtyChange}
                  type="text"
                  value={sellQty}
                  disabled={!price || loading}
                />
                
              </>
            )}
          </div>

          <div className="w-44">
  <p className="border text-2xl flex justify-center items-center w-full h-14 rounded-md px-3">
    {coin?.coinDetails?.symbol
      ? `${formattedQuantity} ${coin.coinDetails.symbol.toUpperCase()}`
      : formattedQuantity}
  </p>
</div>

        </div>

        {insufficientFunds && <h1 className="text-red-600 text-center pt-4">Insufficient wallet balance to buy</h1>}
        {insufficientQty && <h1 className="text-red-600 text-center pt-4">Insufficient quantity to sell</h1>}
      </div>

      {/* COIN INFO */}
      <div className="flex gap-5 items-center">
        <Avatar>
          <AvatarImage src={coin?.coinDetails?.image?.thumb ?? "https://assets.coingecko.com/coins/images/279/standard/ethereum.png"} />
          <AvatarFallback>{coin?.coinDetails?.symbol ? coin.coinDetails.symbol[0].toUpperCase() : "C"}</AvatarFallback>
        </Avatar>

        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold">{coin?.coinDetails?.symbol?.toUpperCase() ?? "BTC"}</p>
            <DotIcon className="text-gray-400" />
            <p className="text-gray-400">{coin?.coinDetails?.name ?? "Bitcoin"}</p>
          </div>

          <div className="flex items-end gap-2">
            <p className="text-xl font-bold">{formattedPrice}</p>
            <p className="text-red-500">
              <span>{coin?.coinDetails?.market_data?.price_change_24h ?? "-"}</span>
              <span> ({coin?.coinDetails?.market_data?.price_change_percentage_24h ?? "-" }%)</span>
            </p>
          </div>
        </div>
      </div>

      {/* ORDER INFO */}
      <div className="flex items-center justify-between">
        <p>Order Type</p>
        <p>Market Order</p>
      </div>

      <div className="flex items-center justify-between">
        <p>{orderType === "BUY" ? "Available Cash" : "Available Quantity"}</p>
       <p>
  {orderType === "BUY"
    ? Number(walletBalance).toLocaleString("en-IN", { style: "currency", currency: "USD" })
    : formattedAssetQty}
</p>

      </div>

      {/* ACTION */}
      <div className="flex gap-3">
        <Button onClick={handlePlaceOrder} disabled={disabledAction}>
          {loading ? "Processing..." : orderType}
        </Button>

        <Button variant="outline" onClick={() => { setOrderType((p) => (p === "BUY" ? "SELL" : "BUY")); setAmount(""); setSellQty(""); }} disabled={loading}>
          {orderType === "BUY" ? "Or Sell" : "Or Buy"}
        </Button>
      </div>
    </div>
  );
};

export default TradingForm;
