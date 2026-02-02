// src/page/Auth/SigninForm.jsx
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
import { login } from "@/State/Auth/Action";
import { useNavigate } from "react-router-dom";

const SigninForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setServerError("");
    setLoading(true);
    try {
      // dispatch(login) expects credentials object {email, password}
      const res = await dispatch(login(data));
      if (res && res.success) {
        // login thunk already fetched profile and set GET_USER_SUCCESS
        navigate("/");
      } else {
        // show server error message (could be 403 or other)
        const err = res?.error;
        const message = (typeof err === "string" && err) || (err && err.message) || JSON.stringify(err) || "Login failed";
        setServerError(message);
      }
    } catch (err) {
      console.error("Unexpected login error:", err);
      setServerError("Unexpected error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-7 py-8 ">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
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
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SigninForm;
