import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getServerSession } from "next-auth";
import { User } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function DELETE(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Not authenticated'
    }), { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url); // Get query parameters
    const messageId = searchParams.get("messageId"); // Extract messageId from URL

    if (!messageId) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Message ID is required'
      }), { status: 400 });
    }

    const updateMessageResult = await UserModel.findOneAndUpdate(
      { _id: user._id },
      { $pull: { messages: { _id: messageId } } },
      { new: true }
    );

    if (!updateMessageResult) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Message not found or already deleted'
      }), { status: 404 });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Message deleted successfully'
    }), { status: 200 });

  } catch (error) {
    console.error('Error while deleting user messages', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error while deleting user messages'
    }), { status: 500 });
  }
}
