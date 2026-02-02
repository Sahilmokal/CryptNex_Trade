import React, { useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@radix-ui/react-dialog";
import { ReloadIcon, UpdateIcon } from "@radix-ui/react-icons";
import { CopyIcon, DollarSign, ShuffleIcon, UploadIcon, WalletIcon, X } from "lucide-react";
import TopupForm from "./TopupForm";
import WithdrawalForm from "./WithdrawalForm";
import TransferForm from "./TransferForm";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import { getUserWallet, depositMoney, getWalletTransactions } from "@/State/Wallet/Action";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Toggle to show helpful debugging info in each transaction card.
 * Set to true during development to validate heuristics.
 */
const DEBUG_TX = false;

const Wallet = () => {
  const dispatch = useDispatch();
  const { wallet } = useSelector((store) => store);
  const location = useLocation();
  const navigate = useNavigate();

  // Query params
  const query = new URLSearchParams(location.search);
  const orderId = query.get("order_id");
  const paymentId = query.get("payment_id");
  const razorpayPaymentId = query.get("razorpay_payment_id");

  // Stable fetch handlers
  const handleFetchUserWallet = useCallback(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      console.warn("[Wallet] no jwt found in localStorage");
      return Promise.resolve();
    }
    return dispatch(getUserWallet(jwt)).catch((err) => {
      console.error("[Wallet] getUserWallet failed:", err);
    });
  }, [dispatch]);

  const handleFetchWalletTransaction = useCallback(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      console.warn("[Wallet] no jwt found for transactions");
      return Promise.resolve();
    }
    return dispatch(getWalletTransactions({ jwt })).catch((err) => {
      console.error("[Wallet] getWalletTransactions failed:", err);
    });
  }, [dispatch]);

  // If redirect from payment, call deposit endpoint
  useEffect(() => {
    if (orderId) {
      const jwt = localStorage.getItem("jwt");
      if (!jwt) {
        console.warn("[Wallet] deposit attempted but no jwt");
        return;
      }
      dispatch(
        depositMoney({
          jwt,
          orderId,
          paymentId: razorpayPaymentId || paymentId,
          navigate,
        })
      )
        .then(() => {
          // refresh wallet and transactions after deposit success
          handleFetchUserWallet();
          handleFetchWalletTransaction();
        })
        .catch((err) => {
          console.error("[Wallet] depositMoney failed:", err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, paymentId, razorpayPaymentId, dispatch, navigate]);

  // fetch wallet and transactions on mount
  useEffect(() => {
    handleFetchUserWallet();
    handleFetchWalletTransaction();
  }, [handleFetchUserWallet, handleFetchWalletTransaction]);

  // Helper: Safely parse dates to formatted string
  const formatDate = (rawDate) => {
    if (!rawDate) return "—";
    try {
      const d = new Date(rawDate);
      if (Number.isNaN(d.getTime())) return "—";
      return d.toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  // Helper: lookup nested keys safely
  const nestedLookup = (obj, path) => {
    if (!obj) return undefined;
    return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
  };

  // Helper: choose the first defined-ish value from list
  const firstDefined = (...args) => {
    for (const v of args) {
      if (v !== undefined && v !== null) return v;
    }
    return undefined;
  };

  // Currency formatter factory
  const formatCurrency = (amount, currency) => {
    try {
      // if currency is provided and is a valid ISO code, use it; else fallback to 'INR' or 'USD'
      const currencyCode = (currency && String(currency).toUpperCase().slice(0, 3)) || "USD";
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: 2,
      }).format(Number(amount || 0));
    } catch {
      return Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
    }
  };

  return (
    <div className="scale-[1] origin-top">
      <div className="flex flex-col items-center">
        <div className="pt-5 w-full lg:w-[60%]">
          <Card>
            <CardHeader className="pb-5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-5">
                  <WalletIcon size={20} />
                  <div>
                    <CardTitle className="text-1xl">My Wallet</CardTitle>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-200 text-sm">#{wallet?.userWallet?.id ?? "—"}</p>
                      <CopyIcon size={10} className="cursor-pointer hover:text-slate-200" />
                    </div>
                  </div>
                </div>

                <div>
                  <ReloadIcon
                    onClick={() => {
                      handleFetchUserWallet();
                      handleFetchWalletTransaction();
                    }}
                    className="w-5 h-5 cursor-pointer hover:text-gray-400"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-3">
                
                <span className="text-1x font-semibold">
                  {formatCurrency(wallet?.userWallet?.balance ?? 0, wallet?.userWallet?.currency ?? "USD")}
                </span>
              </div>

              <div className="flex gap-7 mt-5">
                {/* ADD MONEY */}
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="h-20 w-20 hover:text-gray-400 cursor-pointer items-center justify-center flex flex-col rounded-md shadow-md">
                      <UploadIcon />
                      <span className="text-sm mt-1">Add Money</span>
                    </button>
                  </DialogTrigger>

                  <DialogPortal>
                    <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />

                    <DialogContent className="fixed inset-0 flex items-center justify-center p-4 z-50">
                      <div className="dark:bg-slate-900 rounded-lg shadow-lg max-w-lg w-full">
                        <div className="flex items-center justify-between px-5 py-4 border-b">
                          <DialogTitle className="text-lg font-semibold">Top Up Your Wallet</DialogTitle>
                          <DialogClose asChild>
                            <button aria-label="Close" className="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800">
                              <X className="w-5 h-5" />
                            </button>
                          </DialogClose>
                        </div>
                        <div className="p-5">
                          <TopupForm />
                        </div>
                      </div>
                    </DialogContent>
                  </DialogPortal>
                </Dialog>

                {/* WITHDRAWAL */}
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="h-20 w-20 hover:text-gray-400 cursor-pointer items-center justify-center flex flex-col rounded-md shadow-md">
                      <UploadIcon />
                      <span className="text-sm mt-1">Withdrawal</span>
                    </button>
                  </DialogTrigger>

                  <DialogPortal>
                    <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-md z-40" />

                    <DialogContent className="fixed inset-0 flex items-center justify-center p-4 z-50">
                      <div className="dark:bg-slate-900 rounded-lg shadow-lg max-w-lg w-full">
                        <div className="flex items-center justify-between px-5 py-4 border-b">
                          <DialogTitle className="text-lg font-semibold">Request Withdrawal</DialogTitle>
                          <DialogClose asChild>
                            <button aria-label="Close" className="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800">
                              <X className="w-5 h-5" />
                            </button>
                          </DialogClose>
                        </div>
                        <div className="p-5">
                          <WithdrawalForm />
                        </div>
                      </div>
                    </DialogContent>
                  </DialogPortal>
                </Dialog>

                {/* TRANSFER */}
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="h-20 w-20 hover:text-gray-400 cursor-pointer items-center justify-center flex flex-col rounded-md shadow-md">
                      <ShuffleIcon />
                      <span className="text-sm mt-1">Transfer</span>
                    </button>
                  </DialogTrigger>

                  <DialogPortal>
                    <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-md z-40" />

                    <DialogContent className="fixed inset-0 flex items-center justify-center p-4 z-50">
                      <div className="dark:bg-slate-900 rounded-lg shadow-lg max-w-lg w-full">
                        <div className="flex items-center justify-between px-5 py-4 border-b">
                          <DialogTitle className="text-lg font-semibold">Wallet to Wallet Transfer</DialogTitle>
                          <DialogClose asChild>
                            <button aria-label="Close" className="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800">
                              <X className="w-5 h-5" />
                            </button>
                          </DialogClose>
                        </div>
                        <div className="p-5">
                          <TransferForm />
                        </div>
                      </div>
                    </DialogContent>
                  </DialogPortal>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* History */}
          <div className="py-5 pt-10">
            <div className="flex gap-2 items-center pb-5">
              <h1 className="text-2xl font-semibold">History</h1>
              <UpdateIcon className="h-7 w-7 p-0 cursor-pointer hover:text-gray-400" />
            </div>
            <div className="space-y-5">
              {wallet?.transactions && wallet.transactions.length > 0 ? (
                wallet.transactions.map((item) => {
                  const id = item.id ?? Math.random();

                  const rawDate = firstDefined(
                    item.createdAt,
                    item.created_at,
                    nestedLookup(item, "createdAtString")
                  );
                  const dateStr = formatDate(rawDate);

                  // --- gather potential amount fields (including nested common places)
                  const possibleAmountFields = [
                    item.amount,
                    item.txAmount,
                    item.value,
                    item.amount_value,
                    item.netAmount,
                    item.signedAmount,
                    nestedLookup(item, "data.amount"),
                    nestedLookup(item, "metadata.amount"),
                    nestedLookup(item, "attributes.amount"),
                    nestedLookup(item, "payload.amount"),
                  ];

                  // rawAmount candidate (first non-null-ish)
                  let rawAmount = possibleAmountFields.find((v) => v !== undefined && v !== null);
                  if (rawAmount === undefined) rawAmount = 0;

                  // numeric parse
                  const numericCandidate = Number(String(rawAmount).replace(/[, ]+/g, ""));
                  const parsedAmount = Number.isFinite(numericCandidate) ? numericCandidate : 0;

                  // --- gather text fields to inspect for hints
                  const gatherText = (keys) =>
                    keys
                      .map((k) => {
                        const v = item[k] ?? nestedLookup(item, `data.${k}`) ?? nestedLookup(item, `metadata.${k}`) ?? nestedLookup(item, `attributes.${k}`);
                        return v ? String(v).toLowerCase() : "";
                      })
                      .join(" ");

                  const textToInspect = [
                    item.type,
                    item.txType,
                    item.direction,
                    item.side,
                    item.status,
                    item.narration,
                    item.remarks,
                    item.note,
                    item.description,
                    item.message,
                    item.title,
                    item.summary,
                    item.action,
                    item.transaction_type,
                    nestedLookup(item, "metadata.note"),
                    nestedLookup(item, "data.note"),
                    nestedLookup(item, "attributes.note"),
                    gatherText(["type", "txType", "direction", "side", "status", "narration", "remarks", "note", "description", "message", "action", "transaction_type", "event"]),
                  ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                  // --- helper regex checks
                  const contains = (arr) => arr.some((s) => textToInspect.includes(s));
                  const debitWords = ["debit", "debited", "dr", "withdraw", "withdrawn", "out", "sent", "paid", "payment", "withdrawal"];
                  const creditWords = ["credit", "credited", "cr", "in", "received", "refund", "deposit"];

                  const hasDr = /\bdr\b/.test(textToInspect);
                  const hasCr = /\bcr\b/.test(textToInspect);

                  // explicit flags (boolean fields)
                  const isDebitFlag = item.isDebit === true || item.is_debit === true || item.debit === true;
                  const isCreditFlag = item.isCredit === true || item.is_credit === true || item.credit === true;

                  // explicit signed amount field (if provided)
                  const explicitSigned = (() => {
                    const keys = ["signedAmount", "signed_amount", "netAmount", "net_amount"];
                    for (const k of keys) {
                      const v = item[k] ?? nestedLookup(item, `data.${k}`) ?? nestedLookup(item, `metadata.${k}`);
                      if (v !== undefined && v !== null) {
                        const n = Number(String(v).replace(/[, ]+/g, ""));
                        if (Number.isFinite(n)) return n;
                      }
                    }
                    return null;
                  })();

                  // --- decide signedAmount
                  let signedAmount = 0;
                  let inference = "none";

                  if (explicitSigned !== null) {
                    signedAmount = explicitSigned;
                    inference = "explicitSigned";
                  } else if (parsedAmount < 0) {
                    signedAmount = parsedAmount;
                    inference = "amountNegative";
                  } else if (parsedAmount > 0) {
                    if (isDebitFlag) {
                      signedAmount = -Math.abs(parsedAmount);
                      inference = "isDebitFlag";
                    } else if (isCreditFlag) {
                      signedAmount = Math.abs(parsedAmount);
                      inference = "isCreditFlag";
                    } else if (hasDr || contains(debitWords)) {
                      signedAmount = -Math.abs(parsedAmount);
                      inference = "textHintDebit";
                    } else if (hasCr || contains(creditWords)) {
                      signedAmount = Math.abs(parsedAmount);
                      inference = "textHintCredit";
                    } else {
                      signedAmount = Math.abs(parsedAmount);
                      inference = "fallbackPositiveAsCredit";
                    }
                  } else {
                    signedAmount = 0;
                    inference = "zeroOrUnparseable";
                  }

                  const isDebit = signedAmount < 0;
                  const displayAmount = Math.abs(signedAmount);
                  const currency = firstDefined(item.currency, item.currencyCode, nestedLookup(item, "data.currency"), "USD");

                  const formattedAmount = formatCurrency(displayAmount, currency);

                  return (
                    <div key={id}>
                      <Card className="px-5 flex justify-between items-center p-2">
                        <div className="flex items-center gap-5">
                          <Avatar>
                            <AvatarFallback>
                              <ShuffleIcon />
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <h1 className="font-medium">{item.type ? String(item.type).replace("_", " ") : "Transaction"}</h1>
                            <p className="text-sm text-gray-500">{dateStr}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className={isDebit ? "text-red-500" : "text-green-500"}>
                            {isDebit ? "-" : "+"}
                            {formattedAmount}
                          </p>

                          {DEBUG_TX && (
                            <div className="text-xs text-gray-400 mt-1">
                              <span className="mr-2">[{inference}]</span>
                              <span className="break-words">{String(textToInspect).slice(0, 120)}</span>
                            </div>
                          )}
                        </div>
                      </Card>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-sm text-gray-400">No transactions yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
