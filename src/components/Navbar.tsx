'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { User } from 'next-auth'
import { Button } from './ui/button'
import {  LogOut, MessageCircle, UserRoundPen } from 'lucide-react'
import {  AvatarFallback} from './ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Skeleton } from './ui/skeleton'
const Navbar = () => {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const user: User = session?.user as User;
  const router = useRouter();
  const [loadAvatar, setLoadAvatar] = useState(true)
  useEffect(() => {
    if (status !== 'loading') {
      setTimeout(() => setLoadAvatar(false), 1000);
    }
  }, [session])
  return (
    <nav className='p-4 md:py-4 md:px-8 shadow-md'>
      <div className='container mx-auto flex flex-col md:flex-row justify-between items-center'>
        <Link href="/">
          <span className='text-xl text-purple-900 font-bold flex items-center gap-3 mb-4 md:mb-0'> Silent Sender <MessageCircle /></span>
        </Link>
        {!session ? (
          <Link className='w-full md:w-auto' href={'/sign-in'}>
            <Button className='cursor-pointer bg-purple-900 text-white duration-200 transition-all hover:bg-purple-800'>Login</Button>
          </Link>
        ) : (
          <div>
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger className="focus:outline-none cursor-pointer">
                {loadAvatar ? (
                  <Skeleton className="w-[55px] h-[55px] rounded-full bg-purple-800" />
                ) : user?.avatar ? (
                  <div className="w-[55px] h-[55px] rounded-full overflow-hidden flex items-center justify-center select-none border-[3px] border-purple-600">
                    <Image src={user?.avatar as string} alt="avatar" width={112} height={112} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <AvatarFallback>{user.userName?.charAt(0).toUpperCase() || 'SS'}</AvatarFallback>
                )}
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className='cursor-pointer' onClick={() => router.replace('/edit-profile')} >
                  <UserRoundPen /> Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem className='cursor-pointer' onClick={() => signOut()}>
                  <LogOut /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar