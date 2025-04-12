'use client'

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, UserCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function DiscoverPage() {
  const [allUsers, setAllUsers] = useState([]);
  const [fetchUsers, setFetchUsers] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const getAllUsers = async () => {
      setFetchUsers(true);
      try {
        const response = await axios.get('/api/get-users');
        if ((response.data.users).length > 0) {
          setAllUsers(response?.data.users);
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to fetch all users');
      } finally {
        setFetchUsers(false);
      }
    };
    getAllUsers();
  }, []);

  return (
    <div className="min-h-screen py-10 px-6 max-md:px-3">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold text-center mb-6"
      >
        Discover & Connect Anonymously
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-lg text-center max-w-3xl mx-auto mb-8"
      >
        Browse through the list of users and send them anonymous messages. Share your thoughts, express your feelings, and connect without revealing your identity.
      </motion.p>

      {fetchUsers && (
        <div className="h-[60vh] w-full flex justify-center items-center text-2xl text-gray-600">
          <Loader2 className="w-12 h-12 animate-spin" />
        </div>
      )}

      {allUsers.length <= 0 && fetchUsers || !session ? (
        <div className="h-[60vh] w-full flex justify-center items-center text-2xl text-gray-600">
          No users available at the moment.
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {allUsers.map((user) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white text-black p-8 rounded-xl shadow-xl transform hover:scale-105 transition duration-300">
                <div className="flex flex-col items-center">
                  {user?.avatar ? (
                    <div className="w-[70px] h-[70px] mb-4 rounded-full overflow-hidden flex items-center justify-center select-none border-[4px] border-purple-600">
                      <Image
                        src={user.avatar}
                        alt="avatar"
                        width={112}
                        height={112}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <UserCircle className="w-[70px] h-[70px] text-purple-900 mb-4" />
                  )}

                  <h2 className="text-xl font-bold">{user.userName}</h2>
                  <p className="text-gray-600 text-sm mt-2 text-center">
                    Click below to send an anonymous message.
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    {user.isAcceptingMessage ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-600 text-sm">Accepting Messages</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="text-red-600 text-sm">Not Accepting Messages</span>
                      </>
                    )}
                  </div>
                  <Link href={`/u/${user.userName}`} target="_blank">
                    <Button className="mt-4 bg-purple-900 text-white hover:bg-purple-800 duration-200 transition-all cursor-pointer px-6 py-2 rounded-lg shadow-md">
                      Send Message
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
