import SendMessagesPage from '@/components/SendMessagesPage'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Speak Freely, Stay Anonymous – Send Messages with Silent Sender",
  description: "Silent Sender lets you share your thoughts, confessions, and feedback anonymously. No sign-ups, no tracking—just pure expression. Send your first message now!",
};
const page = () => {
  return (
    <SendMessagesPage />
  )
}

export default page