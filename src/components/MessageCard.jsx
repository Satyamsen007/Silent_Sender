'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "./ui/button"
import { X } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"

const MessageCard = ({ message, onMessageDelete }) => {
  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete(`/api/delete-message/${message._id}`);
      toast.success(response.data.message);
      onMessageDelete(message._id);
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete the message. Please try again.");
    }
  };

  const createdAt = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC"
  }).format(new Date(message.createdAt));

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex justify-between">
            <div>
              <CardTitle className="text-3xl font-bold mb-3">{message.content}</CardTitle>
              <CardDescription className="text-base font-semibold mb-2 text-gray-950">{createdAt}</CardDescription>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-14 cursor-pointer"><X /></Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This message will be permanently removed. Are you sure you want to continue?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                  <AlertDialogAction className="cursor-pointer" onClick={() => handleDeleteConfirm()}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent>
        </CardContent>
      </Card>
    </div>
  )
}

export default MessageCard