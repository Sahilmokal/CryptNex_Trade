// src/page/Payment_Details/PaymentDetailsForm.jsx
import React, { useRef, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
// NOTE: use the same DialogClose that your dialog wrapper exports
import { DialogClose } from "@/components/ui/dialog";
import { useDispatch } from "react-redux";
import { addPaymentDetails } from "@/State/Withdrawal/Action";

const PaymentDetailsForm = () => {
  const dispatch = useDispatch();
  const closeRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      accountHolderName: "",
      bankName: "",
      accountNumber: "",
      confirmAccountNumber: "",
      ifsc: "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await dispatch(
        addPaymentDetails({
          paymentDetails: {
            accountNumber: data.accountNumber,
            accountHolderName: data.accountHolderName,
            ifsc: data.ifsc,
            bankName: data.bankName,
          },
          jwt: localStorage.getItem("jwt"),
        })
      );

      // Close dialog only after success
      if (closeRef.current) closeRef.current.click();
    } catch (err) {
      // show server error in console — paste it here if you need help
      console.error("Payment details submit error:", err.response?.data ?? err.message ?? err);
      // optional: set form error to show a message to user
      // form.setError("accountNumber", { type: "server", message: "Server error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="accountHolderName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Holder Name</FormLabel>
                <FormControl>
                  <Input placeholder="Sahil Mokal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bankName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Name</FormLabel>
                <FormControl>
                  <Input placeholder="Yes Bank" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accountNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter account number" inputMode="numeric" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmAccountNumber"
            rules={{
              validate: (value) =>
                value === form.watch("accountNumber") || "Account numbers do not match",
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Account Number</FormLabel>
                <FormControl>
                  <Input placeholder="Re-enter account number" inputMode="numeric" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ifsc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IFSC</FormLabel>
                <FormControl>
                  <Input placeholder="YESB000007" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit button — NOT wrapped by DialogClose */}
          <div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save details"}
            </Button>
          </div>

          {/* Hidden DialogClose used only to close modal programmatically */}
          <DialogClose asChild>
            <button ref={closeRef} type="button" style={{ display: "none" }} aria-hidden />
          </DialogClose>
        </form>
      </Form>
    </div>
  );
};

export default PaymentDetailsForm;
