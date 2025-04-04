import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import { Message } from "@/model/User";

export async function POST(req: Request) {
  await dbConnect();
  const { userName, content } = await req.json();
  try {
    const user = await UserModel.findOne({userName});
    if (!user) {
      return Response.json({
        success: false,
        message: 'User not found'
      }, { status: 404 })
    }
    //  is user accepting messages
    if (!user.isAcceptingMessage) {
      return Response.json({
        success: false,
        message: 'User is not accepting messages'
      }, { status: 403 })
    }
    const newMessage = {
      content,
      createdAt: new Date()
    }
    user.messages.push(newMessage as Message)
    await user.save();
    return Response.json({
      success: true,
      message: 'Message sent successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Error while sending message',error)
    return Response.json({
      success: false,
      message: 'Error while sending message'
    }, { status: 500 })
  }
}