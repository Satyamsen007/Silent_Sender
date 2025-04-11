import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";

export async function POST(req) {
  await dbConnect();
  const { userName, content } = await req.json();
  
  try {
    const user = await UserModel.findOne({ userName });
    
    if (!user) {
      return Response.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    // Check if user is accepting messages
    if (!user.isAcceptingMessage) {
      return Response.json({
        success: false,
        message: 'User is not accepting messages'
      }, { status: 403 });
    }

    const newMessage = {
      content,
      createdAt: new Date()
    };

    user.messages.push(newMessage);
    await user.save();
    
    return Response.json({
      success: true,
      message: 'Message sent successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error while sending message', error);
    return Response.json({
      success: false,
      message: 'Error while sending message'
    }, { status: 500 });
  }
}