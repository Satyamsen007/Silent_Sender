'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useDebounceCallback } from 'usehooks-ts'
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { signUpSchemaValidation } from "@/schemas/signUpSchema"
import axios from 'axios'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from 'lucide-react'
import { signIn } from "next-auth/react"
import Image from "next/image"
import { motion } from 'framer-motion'

const Page = () => {
  const [userName, setUserName] = useState('');
  const [userNameMessage, setUserNameMessage] = useState('');
  const [isCheckingUserName, setIsCheckingUserName] = useState(false);
  const debounced = useDebounceCallback(setUserName, 300);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const router = useRouter();

  // Form implementation
  const register = useForm({
    resolver: zodResolver(signUpSchemaValidation),
    defaultValues: {
      username: '',
      email: '',
      password: ''
    }
  });

  useEffect(() => {
    const checkUserNameUnique = async () => {
      if (userName) {
        setIsCheckingUserName(true);
        setUserNameMessage('');
        try {
          const response = await axios.get(`/api/check-username-unique?userName=${userName}`);
          setUserNameMessage(response.data.message)
        } catch (error) {
          setUserNameMessage(error.response?.data.message ?? 'Error while checking user name');
        } finally {
          setIsCheckingUserName(false);
        }
      }
    }
    checkUserNameUnique();
  }, [userName]);

  const onSubmit = async (data) => {
    setIsSigningIn(true);
    try {
      const response = await axios.post('/api/sign-up', data);
      if (response.status === 201) {
        toast.success(response.data.message)
        router.replace(`/verify/${userName}`)
      }
    } catch (error) {
      console.log('Error while signUp User', error);
      toast.error(error.response?.data.message);
    } finally {
      setIsSigningIn(false);
    }
  }

  const signinWithGoogle = async () => {
    setIsSigningIn(true)
    const result = await signIn('google', { callbackUrl: '/dashboard' })
    if (result?.error) {
      console.error("Google Sign-In Error:", result.error);
      toast.error("Failed to sign in with Google. Please try again later.");
    }
    setIsSigningIn(false);
  }

  const signinWithGitHub = async () => {
    setIsSigningIn(true)
    const result = await signIn('github', { callbackUrl: '/dashboard' })
    if (result?.error) {
      console.error("GitHub Sign-In Error:", result.error);
      toast.error("Failed to sign in with GitHub. Please try again later.");
    }
    setIsSigningIn(false);
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {(isSigningIn) && (
        <div className="w-full h-screen bg-white absolute opacity-60 flex justify-center items-center">
          <Loader2 className="w-10 h-10 animate-spin text-gray-900" />
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 space-y-8 my-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join Silent Sender
          </h1>
          <p className="mb-4">
            Sign up to start your anonymous adventure
          </p>
        </div>
        <Form {...register}>
          <form onSubmit={register.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="username"
              control={register.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Username" {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        debounced(e.target.value)
                      }}
                    />
                  </FormControl>
                  {isCheckingUserName && <Loader2 className="animate-spin" />}
                  <p className={`text-sm ${userNameMessage == 'UserName is unique' ? 'text-green-500' : 'text-red-500'}`}>{userNameMessage}</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={register.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={register.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSigningIn} className={`${isSigningIn ? 'cursor-not-allowed' : 'cursor-pointer'} w-full`}>
              {
                isSigningIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please Wait
                  </>
                ) : ('SignUp')
              }
            </Button>
          </form>
          <div className="flex items-center justify-center gap-4">
            <Button onClick={signinWithGoogle} className="py-5 flex gap-3 cursor-pointer items-center">
              <span><Image src={'/google.webp=s96-fcrop64=1,00000000ffffffff-rw'} alt="" width={25} height={25} /></span>
              <p className="text-sm">
                Sign up with Google
              </p>
            </Button>
            <Button onClick={signinWithGitHub} className="py-5 flex gap-3 cursor-pointer items-center">
              <span><Image src={'/github-mark-white.png'} alt="" width={25} height={25} /></span>
              <p className="text-sm">
                Sign up with GitHub
              </p>
            </Button>
          </div>
        </Form>
        <div className="text-center">
          <p>
            Already a member?{' '}
            <Link href={'/sign-in'} className="text-blue-600 hover:text-blue-800">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Page