import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogClose } from "@/components/ui/dialog";
import { useDispatch, useSelector } from "react-redux";
import { withdrawalRequest } from "@/State/Withdrawal/Action";

const WithdrawalForm = () => {
  const dispatch = useDispatch();
  const closeRef = useRef(null);
  const [amount, setAmount] = useState("");

  const { wallet, withdrawal } = useSelector((store) => store);

  // pick correct key from store
  const paymentDetails =
    withdrawal?.paymentDetails ?? withdrawal?.PaymentDetails ?? null;

  const balance = wallet?.userWallet?.balance ?? 0;

  const maskedAccount =
    paymentDetails?.accountNumber
      ? "********" + String(paymentDetails.accountNumber).slice(-4)
      : "********----";

  const bankName = paymentDetails?.bankName ?? "No Bank Found";

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(withdrawalRequest({amount, jwt:localStorage.getItem("jwt")}))
    console.log(amount);
    if (closeRef.current) closeRef.current.click();
  };

  return (
    <form onSubmit={handleSubmit} className="pt-10 space-y-5">
      {/* BALANCE */}
      <div className="flex justify-between items-center rounded-md bg-slate-900 text-xl font-bold px-5 py-4">
        <p>Available balance</p>
        <p>${balance}</p>
      </div>

      {/* ENTER AMOUNT */}
      <div className="flex flex-col items-center">
        <h1>Enter Withdrawal Amount</h1>
        <div className="flex items-center justify-center">
          <Input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="withdrawalInput py-7 border-none outline-none px-0 text-2xl"
            placeholder="$9999"
            type="number"
          />
        </div>
      </div>

      {/* BANK DETAILS */}
      <div>
        <p className="pb-2">Transfer to</p>

        <div className="flex items-center gap-5 border px-5 py-2 rounded-md">
          <img
            className="h-8 w-8"
            src="https://cdn.pixabay.com/photo/2021/06/27/14/42/money-6369029_640.png"
            alt="bank"
          />
          <div>
            <p className="text-xl font-bold">{bankName}</p>
            <p className="text-xs">A/C No: {maskedAccount}</p>
          </div>
        </div>
      </div>

      {/* WITHDRAW BUTTON */}
      <Button type="submit" className="w-full py-7 text-xl">
        Withdraw
      </Button>

      {/* HIDDEN DIALOG CLOSE */}
      <DialogClose asChild>
        <button ref={closeRef} type="button" style={{ display: "none" }} />
      </DialogClose>
    </form>
  );
};

export default WithdrawalForm;
