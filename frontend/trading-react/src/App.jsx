// src/App.jsx
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import "./index.css";

// USER components
import Navbar from "./page/Navbar/Navbar";
import Home from "./page/Home/Home";
import Portfolio from "./page/Portfolio/Portfolio";
import Wallet from "./page/Wallet/Wallet";
import Withdrawal from "./page/Withdrawal/Withdrawal";
import PaymentDetails from "./page/Payment_Details/PaymentDetails";
import StockDetails from "./page/Stock Details/StockDetails";
import Watchlist from "./page/Watchlist/Watchlist";
import Activity from "./page/Activity/Activity";
import Profile from "./page/Profile/Profile";
import SearchCoin from "./page/Search/SearchCoin";
import Notfound from "./page/NotFound/Notfound";
import Auth from "./page/Auth/Auth";

// ADMIN components
import AdminLogin from "./page/Admin/AdminLogin";
import AdminRoute from "./page/Admin/AdminRoute";
import AdminLayout from "./page/Admin/AdminLayout";
import AdminDashboard from "./page/Admin/AdminDashboard";

import { useDispatch, useSelector } from "react-redux";
import { getUser } from "./State/Auth/Action";
import CreateUser from "./page/Admin/CreateUser";
import ManageUsers from "./page/Admin/ManageUsers";
import AdminWithdrawals from "./page/Admin/AdminWithdrawals";
import AdminWithdrawalTransactions from "./page/Admin/AdminWithdrawalTransactions";
import AdminReports from "./page/Admin/AdminReports";

function App() {
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    // 1) If Redux already has a jwt, use it (this covers login within SPA)
    if (auth?.jwt) {
      dispatch(getUser(auth.jwt));
      return;
    }

    // 2) On mount: attempt one-time hydration from localStorage
    const token = localStorage.getItem("jwt");
    if (token) {
      // set token in redux so other code sees it, then fetch profile
      dispatch({ type: "LOGIN_SUCCESS", payload: token });
      dispatch(getUser(token));
    }
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* ADMIN ROUTES (NO NAVBAR) */}
        // ADMIN ROUTES (NO NAVBAR)
<Route path="/admin/login" element={<AdminLogin />} />

<Route
  path="/admin/*"
  element={
    <AdminRoute>
      <AdminLayout />
    </AdminRoute>
  }
>
  <Route index element={<AdminDashboard />} />
  <Route path="manage-users" element={<ManageUsers/>} />
  <Route path="create-user" element={<CreateUser />} />  {/* <-- ADD THIS */}
  <Route path="withdrawals" element={<AdminWithdrawals/>} />
  <Route path="transactions" element={<AdminWithdrawalTransactions />} />
  <Route path="reports" element={<AdminReports/>} />
  <Route path="notifications" element={<div>Notifications Page</div>} />
</Route>


        {/* USER AUTH PAGES (shown only when user is not logged in) */}
        {!auth?.user && <Route path="/*" element={<Auth />} />}

        {/* USER LOGGED-IN PAGES */}
        {auth?.user && (
          <Route
            path="/*"
            element={
              <div>
                <Navbar />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/activity" element={<Activity />} />
                  <Route path="/wallet" element={<Wallet />} />
                  <Route path="/withdrawal" element={<Withdrawal />} />
                  <Route path="/payment-details" element={<PaymentDetails />} />
                  <Route path="/market/:id" element={<StockDetails />} />
                  <Route path="/watchlist" element={<Watchlist />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/search" element={<SearchCoin />} />
                  <Route path="*" element={<Notfound />} />
                </Routes>
              </div>
            }
          />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
