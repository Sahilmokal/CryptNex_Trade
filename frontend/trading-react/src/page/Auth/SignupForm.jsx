// src/page/Auth/SignupForm.jsx
import React, { useState } from "react";
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
import { useDispatch } from "react-redux";
import { register } from "@/State/Auth/Action";
import { useNavigate } from "react-router-dom";

const SignupForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  // Await the thunk, navigate only on success
  const onSubmit = async (data) => {
    setServerError("");
    setLoading(true);
    try {
      // dispatch(register) should return { success: true/false, ... }
      const res = await dispatch(register(data));
      if (res && res.success) {
        // registration OK -> go to login page
        navigate("/login");
      } else {
        setServerError(res?.error?.message || res?.error || "Registration failed. Try again.");
      }
    } catch (err) {
      console.error("Unexpected register error:", err);
      setServerError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 py-4">
      <h1 className="text-2xl font-bold mb-5">Register your Account</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Enter Full Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Enter Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Enter password" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {serverError && <div className="text-red-600 text-sm">{serverError}</div>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SignupForm;
