import React from "react";
import { DotFilledIcon } from "@radix-ui/react-icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // optional: for submit
import { useDispatch } from "react-redux";
import { paymentHandler } from "@/State/Wallet/Action";

const PAYMENT_METHODS = [
  { id: "razorpay", label: "Razorpay", value: "RAZORPAY" },
  
  { id: "stripe", label: "Stripe", value: "STRIPE" },
];
const handleSubmit = () => {
    console.log(amount, paymentMethod);
}

const TopupForm = () => {
  const [amount, setAmount] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState("RAZORPAY");
  const dispatch = useDispatch();

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleChange = (e) => {
    setAmount(e.target.value);
  };

const handleSubmit = (e) => {
  e.preventDefault(); // ✅ prevent page refresh

  if (!amount || Number(amount) <= 0) {
    alert("Please enter a valid amount");
    return;
  }

  dispatch(
    paymentHandler({
      jwt: localStorage.getItem("jwt"),
      paymentMethod,
      amount: Number(amount), // ✅ Stripe requires number
    })
  );

  console.log("submit", {
    amount: Number(amount),
    paymentMethod,
  });
};


  return (
    <form onSubmit={handleSubmit} className="pt-6 space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Enter Amount</label>
        <Input
          onChange={handleChange}
          value={amount}
          className="py-3 text-lg"
          placeholder="$9999"
          aria-label="Amount"
          name="amount"
          inputMode="numeric"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Select Payment Method</label>

        <div className="flex flex-col gap-3">
          {PAYMENT_METHODS.map((m) => (
            <label
              key={m.id}
              htmlFor={m.id}
              className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer
                ${paymentMethod === m.value ? "border-sky-500 dark:bg-slate-800" : "border-transparent"}
              `}
            >
              <input
                id={m.id}
                type="radio"
                name="paymentMethod"
                value={m.value}
                checked={paymentMethod === m.value}
                onChange={handlePaymentMethodChange}
                className="sr-only" // hidden native control; label handles visuals
              />

              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 dark:bg-slate-800">
                <DotFilledIcon className="w-4 h-4" />
              </span>

              <div>
                <div className="text-sm font-medium">{m.label}</div>
                <div className="text-xs text-gray-500">Pay with {m.label}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <Button onClick={handleSubmit} type="submit">Proceed</Button>
      </div>
    </form>
  );
};

export default TopupForm;
