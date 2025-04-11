'use client'

import MessageCard from "@/components/MessageCard"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { acceptMessagesSchemaValidation } from "@/schemas/acceptMessageSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { Check, Loader2, RefreshCcw } from "lucide-react"
import { useSession } from "next-auth/react"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { motion } from 'framer-motion'

const DashboardPage = () => {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSwitchLoading, setIsSwitchLoading] = useState(false)
  const [isCopy, setIsCopy] = useState(false)
  const { data: session } = useSession()

  const handleDeleteMessage = (messageId) => {
    setMessages(prev => prev.filter(msg => msg._id !== messageId))
  }

  const form = useForm({
    resolver: zodResolver(acceptMessagesSchemaValidation)
  })

  const { register, watch, setValue } = form
  const acceptMessages = watch('acceptMessages')

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true)
    try {
      const response = await axios.get('/api/accept-messages')
      setValue('acceptMessages', response.data.isAcceptingMessage || false)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to fetch message setting')
    } finally {
      setIsSwitchLoading(false)
    }
  }, [setValue])

  const fetchMessages = useCallback(async (refresh = false) => {
    setIsLoading(true)
    setIsSwitchLoading(false)
    try {
      const response = await axios.get('/api/get-messages')
      setMessages(response.data.messages || [])
      if (refresh) {
        toast.success('Showing latest messages')
      }
    } catch (error) {
      console.log(error?.response?.data?.message);
      toast.error(error?.response?.data?.message || 'Failed to fetch messages')
    } finally {
      setIsLoading(false)
      setIsSwitchLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!session || !session.user) return
    fetchMessages()
    fetchAcceptMessages()
  }, [session, fetchMessages, fetchAcceptMessages])

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post('/api/accept-messages', {
        acceptMessages: !acceptMessages
      })
      setValue('acceptMessages', !acceptMessages)
      toast.success(response.data.message)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update message setting')
    }
  }

  const userName = session?.user?.userName || ''
  const profileUrl = `${window.location.origin}/u/${userName}`

  const copyToClipboard = () => {
    setIsCopy(true)
    setTimeout(() => {
      navigator.clipboard.writeText(profileUrl)
      toast.success('Profile URL has been copied to clipboard')
      setIsCopy(false)
    }, 700)
  }

  if (!session || !session.user) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl"
    >
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button className="cursor-pointer w-20" onClick={copyToClipboard}>
            {isCopy ? (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Check size={24} />
              </motion.div>
            ) : (
              'Copy'
            )}
          </Button>
        </div>
      </div>
      <div className="mb-4">
        <Switch
          className="cursor-pointer"
          {...register('acceptMessages')}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessages ? 'On' : 'Off'}
        </span>
      </div>
      <Separator />

      <Button
        className="mt-4 cursor-pointer"
        variant="outline"
        onClick={(e) => {
          e.preventDefault()
          fetchMessages(true)
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="w-4 h-4" />
        )}
      </Button>

      <div>
        {messages.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {messages.map((message) => (
              <MessageCard
                key={message._id}
                message={message}
                onMessageDelete={handleDeleteMessage}
              />
            ))}
          </div>
        ) : (
          <div className="w-full h-[40vh] text-2xl flex items-center justify-center">
            <p>No message to display.</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default DashboardPage
