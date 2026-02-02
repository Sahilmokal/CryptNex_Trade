import React from 'react';
import { Button } from '@/components/ui/button';
import { SheetClose } from '@/components/ui/sheet';
import {
  ActivityLogIcon,
  DashboardIcon,
  ExitIcon,
  PersonIcon,
} from '@radix-ui/react-icons';
import {
  BookmarkIcon,
  CreditCardIcon,
  HomeIcon,
  LandmarkIcon,
  WalletIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '@/State/Auth/Action';

const menu = [
  { name: "Home", path: "/", icon: <HomeIcon className="h-5 w-5" /> },
  { name: "Portfolio", path: "/portfolio", icon: <DashboardIcon className="h-5 w-5" /> },
  { name: "Watchlist", path: "/watchlist", icon: <BookmarkIcon className="h-5 w-5" /> },
  { name: "Activity", path: "/activity", icon: <ActivityLogIcon className="h-5 w-5" /> },
  { name: "Wallet", path: "/wallet", icon: <WalletIcon className="h-5 w-5" /> },
  { name: "Payment Details", path: "/payment-details", icon: <LandmarkIcon className="h-5 w-5" /> },
  { name: "Withdrawal", path: "/withdrawal", icon: <CreditCardIcon className="h-5 w-5" /> },
  { name: "Profile", path: "/profile", icon: <PersonIcon className="h-5 w-5" /> },
  { name: "Logout", path: "/", icon: <ExitIcon className="h-5 w-5" /> },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  }
  
  return (
    <div className="space-y-2">
      {menu.map((item) => (
        <SheetClose key={item.name} className="w-full">
          <Button
            variant="outline"
            className="flex items-center gap-4 py-5   w-full justify-start"
            onClick={() => {
              navigate(item.path)
              if(item.name=="Logout"){
                handleLogout()
              }
            } }
          >
            <span className="w-6 px-6">{item.icon}</span>
            <p className="text-base">{item.name}</p>
          </Button>
        </SheetClose>
      ))}
    </div>
  );
};

export default Sidebar;
