import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getServerSession } from "next-auth";
import { User } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

type Params = {
  params: {
    messageId: string;
  };
};
export async function DELETE(req: Request, { params }: Params) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;
  if (!session || !session.user) {
    return Response.json({
      success: false,
      message: 'Not authenticated'
    }, { status: 401 })
  }
  try {
    const { messageId } = params;
    const updateMessageResult = await UserModel.findOneAndUpdate({ _id: user._id }, { $pull: { messages: { _id: messageId } } }, { multi: true, upsert: false, new: true });
    if (!updateMessageResult) {
      return Response.json({
        success: false,
        message: 'Message not found or already deleted',
      }, { status: 401 })
    }
    return Response.json({
      success: true,
      message: 'Message deleted successfully',
    }, { status: 200 })
  } catch (error) {
    console.error('Error while deleting user messages', error);
    return Response.json({
      success: false,
      message: 'Error while deleting user messages'
    }, { status: 500 })
  }
}