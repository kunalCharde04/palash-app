"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PrimaryButton, SecondaryButton } from "@/app/components/ui/buttons/index";
import { Input } from "@/app/components/ui/input/input";
import { Label } from "@/app/components/ui/label/index";
import { LoadingSpinner } from "@/app/components/forms/loading";
import { signInFailure } from "@/app/features/auth/auth-slice"
import { signInSuccess } from "@/app/features/auth/auth-slice"
import { signInStart } from "@/app/features/auth/auth-slice"
import { useDispatch, useSelector } from "react-redux"
import { signInUser } from "@/app/api/auth"
import { Loader2 } from "lucide-react";
import { useToast } from "@/app/components/ui/toast/use-toast";
import { ToastProvider } from "@/app/components/ui/toast/toast";


export function SignInForm() {
  const [email, setEmail] = useState("")
  const [shouldThrowError, setShouldThrowError] = useState(false)
  const router = useRouter()
  const dispatch = useDispatch()
  const {isLoading, error} = useSelector((state: any) => state.authReducer);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Test error boundary
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[6-9]\d{9}$/;
      const isEmail = emailRegex.test(email);
      const isPhone = phoneRegex.test(email);

      if(isPhone) {
        toast({
          title: "Invalid Input",
          description: "Currently we only support email sign in",
          variant: "destructive"
        })
        return;
      }
      
      if (!isEmail && !isPhone) {
        toast({
          title: "Invalid Input",
          description: "Please enter a valid email address (e.g. user@example.com) or phone number (10 digits starting with 6-9)",
          variant: "destructive"
        })
        return;
      }

      dispatch(signInStart())
      await signInUser(email)
      toast({
        title: "OTP Sent",
        description: "Please check your inbox or spam folder.",
        variant: "default"
      })
      dispatch(signInSuccess(email))
      router.push("/verify?type=signin")
    }
    catch(err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "An error occurred",
        variant: "destructive"
      })
      dispatch(signInFailure(err.response?.data?.message || "An error occurred"))
    }
  }

  if(error) {
    return <div className="flex flex-col items-center justify-center ">
      <p className="text-red-500 text-center text-sm">{error}</p> 
      <button className="text-blue-500 hover:underline mt-5" onClick={() => dispatch(signInFailure(""))}>Try again</button>
    </div>
  } 

  return (
      <div className="space-y-6">
        <ToastProvider />
        {/* <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-primary_button">Sign In</h1>
      </div> */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phoneOrEmail">Enter your email</Label>
            <Input
              id="phoneOrEmail"
              type="text"
              placeholder="eg. johndoe@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <PrimaryButton type="submit" isLoading={isLoading} loadingText="Submitting..." disabled={email === ""} className="w-full bg-teal-900 py-6 text-white hover:bg-teal-800">
           Submit 
          </PrimaryButton>
          <SecondaryButton className="w-full py-6" onClick={() => router.push("/")} type="button">Back to Site</SecondaryButton>
          <p className="text-sm text-muted-foreground text-center">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-orange-500 hover:underline">
              Create now
            </Link>
          </p>
        </form>
      </div>
  )
}