import React, { useState } from 'react'
import axios from "axios";
import {
  DialogClose,
} from "@/components/ui/dialog"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Button } from '@/components/ui/button'
import { useSelector } from 'react-redux'
import api from '@/config/api'

const AccountVerificationForm = () => {
  const [otp, setOtp] = useState("")
  const { auth } = useSelector(store => store)

  const sendOtp = async () => {
  try {
    await api.patch(
      "/api/users/verification/EMAIL/send-otp",
      {},
      { headers: { Authorization: "" } } // force remove
    );
    alert("OTP sent");
  } catch (e) {
    console.error(e);
  }
};



  const verifyOtp = async () => {
    try {
      await api.patch(
        `/api/users/enable-two-factor/verify-otp/${otp}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        }
      )
      alert("Two-step verification enabled")
      window.location.reload()
    } catch (err) {
      alert("Invalid OTP")
    }
  }

  return (
    <div className='space-y-5 mt-4'>

      <div className='flex gap-2'>
        <p>Email:</p>
        <p className='text-gray-500'>{auth.user?.email}</p>
      </div>

      <Button onClick={sendOtp}>Send OTP</Button>

      <div className='py-5 flex gap-6 items-center'>
        <InputOTP value={otp} onChange={setOtp} maxLength={6}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>

        <DialogClose>
          <Button onClick={verifyOtp}>Verify</Button>
        </DialogClose>
      </div>

    </div>
  )
}

export default AccountVerificationForm
