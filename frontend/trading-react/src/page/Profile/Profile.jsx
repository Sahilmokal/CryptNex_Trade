import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VerifiedIcon } from 'lucide-react'
import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import AccountVerificationForm from './AccountVerificationForm'
import { useSelector } from 'react-redux'

const Profile = () => {
  const { auth } = useSelector(store => store)

  return (
    <div className='flex flex-col items-center mb-5'>
      <div className='pt-10 w-full lg:w-[80%]'>

        {/* USER INFO CARD (UNCHANGED) */}
        <Card>
          <CardHeader>
            <CardTitle className=" pb-4">Your Information</CardTitle>
            <CardContent>
              <div className='lg:flex gap-32'>
                <div className='space-y-5'>
                  <div className='flex'>
                    <p className='w-[9rem]'>Email : </p>
                    <p className='text-gray-400'>{auth.user?.email}</p>
                  </div>
                  <div className='flex'>
                    <p className='w-[9rem]'>Full Name : </p>
                    <p className='text-gray-400'>{auth.user?.fullName}</p>
                  </div>
                  <div className='flex'>
                    <p className='w-[9rem]'>Date of Birth : </p>
                    <p className='text-gray-400'>19/05/2004</p>
                  </div>
                  <div className='flex'>
                    <p className='w-[9rem]'>Nationality : </p>
                    <p className='text-gray-400'>Indian</p>
                  </div>
                </div>

                <div className='space-y-5'>
                  <div className='flex'>
                    <p className='w-[9rem]'>Address: </p>
                    <p className='text-gray-400'>Nalpada, Thane</p>
                  </div>
                  <div className='flex'>
                    <p className='w-[9rem]'>City : </p>
                    <p className='text-gray-400'>Thane</p>
                  </div>
                  <div className='flex'>
                    <p className='w-[9rem]'>Postal Code </p>
                    <p className='text-gray-400'>400610</p>
                  </div>
                  <div className='flex'>
                    <p className='w-[9rem]'>Country : </p>
                    <p className='text-gray-400'>India</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </CardHeader>
        </Card>

        {/* 🔐 MFA SECTION (ONLY THIS EDITED)
        <div className='mt-6'>
          <Card className="w-full">
            <CardHeader className="pb-7">
              <div className='flex items-center gap-3'>
                <CardTitle>2 Step Verification</CardTitle>

                {auth.user?.twoFactorEnabled ? (
                  <Badge className="space-x-2 text-white bg-green-600">
                    <VerifiedIcon size={14} />
                    <span>Enabled</span>
                  </Badge>
                ) : (
                  <Badge className="bg-orange-500">
                    Disabled
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {!auth.user?.twoFactorEnabled && (
                <div className='flex justify-start'>
                  <Dialog>
                    <DialogTrigger>
                      <Button>Enable Two Step Verification</Button>
                    </DialogTrigger>

                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Verify your Account</DialogTitle>
                        <AccountVerificationForm />
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        </div> */}

      </div>
    </div>
  )
}

export default Profile
