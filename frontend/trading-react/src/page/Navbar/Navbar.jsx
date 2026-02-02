import React, { useState } from "react";
import "../../index.css";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DragHandleHorizontalIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Sidebar from "./Sidebar";
import { useSelector, useDispatch } from "react-redux";
import { searchCoin } from "@/State/Coin/Action";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const user = useSelector((state) => state.auth?.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");

  if (!user) return null;

  const displayName = user.fullName || user.email || "User";
  const initial = displayName.trim()[0].toUpperCase();
  const avatarUrl =
    user.avatar && user.avatar.trim() !== "" ? user.avatar : undefined;

  // 🔍 SEARCH HANDLER
const handleSearchKey = (e) => {
  if (e.key === "Enter") {
    if (!query.trim()) {
      dispatch({ type: "CLEAR_SEARCH_RESULTS" });
      return;
    }
    dispatch(searchCoin(query.trim()));
  }
};


  return (
    <div
      className="fixed top-0 left-0 w-full border-b z-50 bg-background/60 backdrop-blur-md flex items-center justify-between px-4 py-2"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* LEFT */}
      <div className="flex items-center gap-4">
        {/* SIDEBAR */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-11 w-11"
              aria-label="Open sidebar"
            >
              <DragHandleHorizontalIcon className="h-7 w-7" />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="w-72 flex flex-col justify-between h-screen"
          >
            <div className="pt-6 pb-4 border-b flex justify-center">
              <SheetHeader>
                <SheetTitle>
                  <div className="text-2xl flex items-center gap-2">
                    <Avatar>
                      <AvatarImage
                        className="h-7"
                        src="https://cdn-icons-png.flaticon.com/128/1490/1490849.png"
                        alt="CryptNex logo"
                      />
                    </Avatar>
                    <div>
                      <span className="font-bold text-orange-700">
                        CryptNex
                      </span>
                      <span className="ml-1">Trade</span>
                    </div>
                  </div>
                </SheetTitle>
              </SheetHeader>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <Sidebar />
            </div>
          </SheetContent>
        </Sheet>

        {/* LOGO */}
        <p className="text-sm lg:text-base font-semibold cursor-pointer">
          CryptNexTrade
        </p>

        {/* 🔍 SEARCH INPUT */}
        <div className="flex items-center gap-2 border rounded-md px-2 h-10 bg-background">
          <MagnifyingGlassIcon />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearchKey}
            placeholder="Search coin..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      </div>

      {/* RIGHT */}
      <Link to="/profile" aria-label="Go to profile">
        <Avatar className="h-10 w-10 rounded-full bg-orange-500 text-white font-semibold cursor-pointer">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={`${displayName} avatar`} />
          ) : (
            <AvatarFallback>{initial}</AvatarFallback>
          )}
        </Avatar>
      </Link>
    </div>
  );
};

export default Navbar;
