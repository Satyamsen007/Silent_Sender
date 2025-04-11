'use client'

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { messageSchemaValidation } from "@/schemas/messageSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { motion } from 'framer-motion'

const SendMessagesPage = () => {
  const params = useParams();
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [messages, setMessages] = useState([
    "What's your favorite movie?",
    "Do you have any pets?",
    "What's your dream job?"
  ])
  const [messageSent, setMessageSent] = useState(false);
  const userName = params.username;
  const form = useForm({
    resolver: zodResolver(messageSchemaValidation),
    defaultValues: {
      content: ''
    }
  });
  const { register, setValue } = form;
  
  const onSubmit = async (data) => {
    setMessageSent(true);
    try {
      const response = await axios.post('/api/send-message', { userName, content: data.content });
      toast.success(response?.data.message)
    } catch (error) {
      toast.error(error.response?.data.message || 'Failed to send a message')
    } finally {
      setMessageSent(false)
    }
  }

  const suggestMessages = async () => {
    setIsLoadingMessages(true);
    try {
      const response = await axios.get('/api/suggest-messages')
      if (response.status == 200) {
        setMessages(response?.data?.suggestions);
      }
    } catch (error) {
      toast.error(error.response?.data.message || 'Failed to get suggested messages')
    } finally {
      setIsLoadingMessages(false)
    }
  }

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <motion.h1
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-8 text-center">Public Profile Link</motion.h1>
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="content"
              control={form.control}
              render={() => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold mb-2 ml-2">Send Anonymous Message to @{userName}</FormLabel>
                  <FormControl>
                    <textarea {...register('content')} placeholder="Write your anonymous message here" rows={5} className="p-4 resize-none border-2 outline-none border-solid rounded-md"></textarea>
                  </FormControl>
                  <FormMessage className="text-lg font-semibold mb-2 ml-2" />
                </FormItem>
              )}
            />
            <div className="w-full flex justify-center items-center">
              <Button type="submit" disabled={messageSent} className="cursor-pointer w-1/4">
                {
                  messageSent ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> <span>Sending..</span>
                    </div>
                  ) : (
                    'Send it'
                  )
                }
              </Button>
            </div>
          </form>
        </Form>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="py-20">
        <Button disabled={isLoadingMessages} onClick={suggestMessages} className='mb-4 cursor-pointer'>Suggest Messages</Button>
        <div>
          <h2 className="text-lg font-semibold mb-2">Click on any message below to select it.</h2>
          <div className="border-2 border-solid p-5 py-8 rounded-md">
            <h2 className="text-xl font-bold mb-2 pb-4 border-solid border-b-2 border-gray-300">Messages</h2>
            <div className="flex flex-col gap-6">
              {
                isLoadingMessages ? (
                  Array.from([1, 2, 3]).map((item) => (
                    <Skeleton key={item} className="bg-gray-300 py-8 w-full" />
                  ))
                ) : (
                  messages.map((message, i) => (
                    <div 
                      onClick={(e) => {
                        const target = e.target;
                        setValue('content', target.textContent || '');
                        toast.success('Message added')
                      }}
                      className="border-solid border-b-2 border-gray-300 text-center hover:bg-gray-300 duration-200 cursor-pointer hover:rounded-md" 
                      key={i}
                    >
                      <p className="text-lg font-semibold py-5">{message}</p>
                    </div>
                  ))
                )
              }
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SendMessagesPage;