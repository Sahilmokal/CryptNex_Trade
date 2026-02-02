import React, { useState, useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { adminLogin } from "@/State/Auth/Action";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((s) => s.auth);
  const user = auth?.user;

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const form = useForm({ defaultValues: { email: "", password: "" } });

  const onSubmit = async (data) => {
    setServerError("");
    setLoading(true);
    try {
      const res = await dispatch(adminLogin(data));
      if (!res || !res.success) {
        const err = res?.error;
        const msg = (typeof err === "string" && err) || err?.message || JSON.stringify(err) || "Login failed";
        setServerError(msg);
        setLoading(false);
        return;
      }
      // adminLogin fetches profile; when auth.user is set and user has admin role, effect below will navigate
    } catch (err) {
      console.error("Admin login error:", err);
      setServerError("Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      // user.userRole might be enum name or ordinal; check both
      const role = user.userRole ?? user.user_role ?? user.role;
      if (role === "ROLE_ADMIN" || Number(role) === 0 || Number(role) === 2) {
        navigate("/admin");
      } else {
        // not admin
        // optionally show message
      }
    }
  }, [user, navigate]);

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-background/70 backdrop-blur rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Admin Login</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Admin email" {...field} />
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
                  <Input type="password" placeholder="Password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {serverError && <div className="text-red-600 text-sm">{serverError}</div>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in as Admin"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
