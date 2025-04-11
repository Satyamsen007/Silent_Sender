'use client'

import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner';
import React, { useState } from 'react'
import axios from 'axios';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { ArrowRight, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Page = () => {
  const router = useRouter();
  const [isCodeExpire, setIsCodeExpire] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const param = useParams();
  const [code, setCode] = useState('');

  const onSubmit = async () => {
    setVerifying(true);
    try {
      const resonse = await axios.post('/api/verify-code', { userName: param.username, code });
      toast.success(resonse?.data.message);
      router.replace('/sign-in')
    } catch (error) {
      const axiosError = error;
      const erroMessage = axiosError.response?.data.message;
      if (erroMessage == 'Verification code has expired pls signUp again to get a new code') {
        setIsCodeExpire(true);
      } else {
        toast.error(erroMessage);
      }
    } finally {
      setVerifying(false);
    }
  }
  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100'>
      <div className='w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md'>
        <div className='text-center'>
          <h1 className='text-4xl font-extrabold tracking-tight lg:text-5xl mb-6'>Verify you account</h1>
          <p className='flex justify-center items-center gap-2'>Enter the verification code sent to your email <span>
            <Mail />
          </span></p>
        </div>
        <div className='flex justify-center items-center'>
          <InputOTP
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e)}
          >
            <InputOTPGroup>
              {[...Array(6)].map((_, index) => (
                <InputOTPSlot data-active={false} key={index} index={index} className="border border-solid border-gray-600 w-14 text-2xl" />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <div className='mt-7 flex justify-center'>
          <Button onClick={() => onSubmit()} disabled={verifying} className='w-1/2 cursor-pointer'>
            {verifying ? (
              <span className='flex gap-3 items-center'>
                <Loader2 className='w-5 h-5 animate-spin' />
                <p>Verifying...</p>
              </span>
            ) : ('Submit')}
          </Button>
        </div>
        {
          isCodeExpire && (
            <div className="text-red-600 font-medium text-center">
              <p className='flex'>Verification code has expired. Please go to sign up again and get a new code. <span>
                <ArrowRight />
              </span></p>
            </div>
          )
        }
      </div>
    </div>
  )
}

export default Page