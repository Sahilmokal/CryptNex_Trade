import React from "react";
import "./Auth.css";
import SignupForm from "./SignupForm";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ForgotPasswordForm from "./ForgotPasswordForm";
import SigninForm from "./SigninForm";

const Auth = () => {
    const navigate = useNavigate()
    const location = useLocation()
  return (
    <div className="authContainer fixed inset-0">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#030712]/50 flex items-center justify-center">
        {/* Center card */}
        <div className="bg-black/60 backdrop-blur-md rounded-xl shadow-2xl px-8 py-10 w-[90%] h-[30rem] max-w-md">
          {/* put your login / signup form here */}
          <h1 className="text-4xl font-bold pb-6">CryptNex Trade</h1>
          {location.pathname=="/signup" ? <section>
            <SignupForm />
            <div className="flex items-center justify-center">
                <span>already have an account ?</span>
                <Button onClick={() => navigate("/signin") } variant="ghost">signin</Button>
            </div>
          </section> : location.pathname=="/forgot-password"?<section>
            <ForgotPasswordForm />
            <div className="flex items-center justify-center">
                <span>back to login ?</span>
                <Button onClick={() => navigate("/signin") } variant="ghost">signin</Button>
            </div>
          </section>:
          <section> <SigninForm />
          <div className="flex items-center justify-center p-2">
                <span>don't have an account ?</span>
                <Button onClick={() => navigate("/signup") } variant="ghost">signup</Button>
            </div>
            <div className="">
                
                <Button className="w-[70%] p-5 " onClick={() => navigate("/forgot-password") } variant="outline">Forgot Password</Button>
            </div>
        </section>}
        </div>
      </div>
    </div>
  );
};

export default Auth;
