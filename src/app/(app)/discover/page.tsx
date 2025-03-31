import DiscoverPage from "@/components/DiscoverPage";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: "Silent Sender – Discover Anonymous Messages & True Thoughts",
  description: "Explore the world of anonymous communication with Silent Sender. Discover unfiltered thoughts, honest feedback, and secret messages shared by others. Stay curious, stay anonymous!",
};
const page = () => {
  return (
    <DiscoverPage />
  )
}

export default page