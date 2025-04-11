'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from 'lucide-react'
import { signInSchemaValidation } from "@/schemas/signInSchema"
import { signIn } from "next-auth/react"
import Image from "next/image"
import { motion } from 'framer-motion'

const Page = () => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const router = useRouter();

  // Form implementation
  const form = useForm({
    resolver: zodResolver(signInSchemaValidation),
    defaultValues: {
      identifier: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setIsSigningIn(true)
    const result = await signIn('credentials', {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
    })
    console.log(result);
    if (result?.error) {
      toast.error(result?.error);
    } else {
      router.replace('/dashboard');
    }
    setIsSigningIn(false);
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
    <div className="flex justify-center items-center min-h-screen relative bg-gray-100">
      {isSigningIn && (
        <div className="w-full h-screen bg-white absolute opacity-60 flex justify-center items-center">
          <Loader2 className="w-10 h-10 animate-spin text-gray-900" />
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join Silent Sender
          </h1>
          <p className="mb-4">
            Sign in to start your anonymous adventure
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email / UserName</FormLabel>
                  <FormControl>
                    <Input placeholder="Email / UserName" {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Password" {...field} required />
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
                ) : ('SignIn')
              }
            </Button>
          </form>
          <div className="flex items-center justify-center gap-4">
            <Button onClick={signinWithGoogle} className="py-5 flex gap-3 cursor-pointer items-center">
              <span><Image src={'/google.webp=s96-fcrop64=1,00000000ffffffff-rw'} alt="" width={25} height={25} /></span>
              <p className="text-sm">
                Sign in with Google
              </p>
            </Button>
            <Button onClick={signinWithGitHub} className="py-5 flex gap-3 cursor-pointer items-center">
              <span><Image src={'/github-mark-white.png'} alt="" width={25} height={25} /></span>
              <p className="text-sm">
                Sign in with GitHub
              </p>
            </Button>
          </div>
        </Form>
        <div className="text-center">
          <p>
            Don&apos;t have an account?{' '}
            <Link href={'/sign-up'} className="text-blue-600 hover:text-blue-800">Sign up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Page