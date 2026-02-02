import React from "react";
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
import { DialogClose } from "@radix-ui/react-dialog";

const ForgotPasswordForm = () => {
  const form = useForm({
    defaultValues: {
      
      email: "",
      
      
    },
  });

  const onSubmit = (data) => {
    console.log("Payment details:", data);
  };

  return (
    <div className="px-7 py-8 ">
        <h1 className="text-2xl font-bold mb-5 ">Forgot Password</h1>
      <Form {...form}>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
          {/* Account Holder Name */}
          
          {/* Bank Name */}
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

          
         
            <Button type="submit" className="w-full  ">
            Submit
          </Button>
         
          
        </form>
      </Form>
    </div>
  );
};

export default ForgotPasswordForm;
