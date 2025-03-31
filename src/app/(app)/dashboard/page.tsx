import DashboardPage from "@/components/DashboardPage"
import { Metadata } from "next";


export const metadata: Metadata = {
  title: "Silent Sender – Your Control Hub for Anonymous Messaging",
  description: "Take full control of your anonymous messages! Manage conversations, explore insights, and customize your Silent Sender experience—all from your personal dashboard.",
};

const page = () => {
  return (
    <DashboardPage />
  )
}

export default page