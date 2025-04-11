'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { motion } from "framer-motion";
import { MessageCircle, Eye, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import Autoplay from 'embla-carousel-autoplay'
import Link from "next/link";

export default function HomePage() {
  const { data: session } = useSession();
  const carouselItems = [
    { text: "Share your thoughts anonymously", icon: MessageCircle },
    { text: "Receive genuine feedback", icon: Eye },
    { text: "Engage without fear", icon: Users }
  ];
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-20 px-6"
      >
        <h1 className="text-4xl font-bold">Silent Sender</h1>
        <p className="mt-3 text-lg">Send anonymous messages and receive honest feedback.</p>
        <Link href='/discover'>
          <Button className="mt-6 bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 cursor-pointer">
            Get Started
          </Button>
        </Link>
      </motion.div>

      {/* Carousel Section */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto py-10"
      >
        <Carousel plugins={[Autoplay({ delay: 3000 })]}>
          <CarouselContent>
            {carouselItems.map((item, index) => (
              <CarouselItem key={index}>
                <Card className="shadow-lg bg-white text-black p-6 rounded-xl flex flex-col items-center border-2 border-solid border-gray-400">
                  <item.icon className="w-10 h-10 text-blue-600" />
                  <CardContent className="text-center">{item.text}</CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-16"
      >
        <h2 className="text-2xl font-semibold">Join the Conversation</h2>
        <p className="mt-3">Start sending and receiving messages anonymously today.</p>
        <Link href={session ? '/dashboard' : '/sign-in'}>
          <Button className="mt-5 bg-yellow-400 transition-all duration-200 cursor-pointer text-black hover:bg-yellow-500">
            {session ? 'Go to dashboard' : 'Join Now'}
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}