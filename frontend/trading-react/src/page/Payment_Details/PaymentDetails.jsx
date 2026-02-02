import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import React, { useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import PaymentDetailsForm from './PaymentDetailsForm'
import { Button } from '@/components/ui/button'
import { useDispatch, useSelector } from 'react-redux'
import { getPaymentDetails } from '@/State/Withdrawal/Action'

const PaymentDetails = () => {
  const { withdrawal } = useSelector(store => store);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getPaymentDetails({ jwt: localStorage.getItem("jwt") }));
  }, [dispatch]);

  // accept either key (backwards-compatibility)
  const details = withdrawal?.PaymentDetails ?? withdrawal?.paymentDetails;

  // debug: remove this after verifying
  // console.log("STORE withdrawal:", withdrawal);

  return (
    <div className='px-20'>
      <h1 className='text-2xl font-bold py-10'>Payment Details</h1>

      {details ? (
        <Card>
          <CardHeader className="items-start pl-12">
            <CardTitle>{details.bankName ?? "Bank"}</CardTitle>

            <CardDescription>
              A/C No: ********{String(details?.accountNumber ?? "").slice(-4)}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className='flex items-center'>
              <p className='w-32'>A/C Holder</p>
              <p className='text-gray-400'>: {details.accountHolderName ?? "—"}</p>
            </div>

            <div className='flex items-center mt-2'>
              <p className='w-32'>IFSC</p>
              <p className='text-gray-400'>: {details.ifsc ?? "—"}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 text-left">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="py-6">Add Payment Details</Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Payment Details</DialogTitle>
              </DialogHeader>

              <PaymentDetailsForm />
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  )
}

export default PaymentDetails
