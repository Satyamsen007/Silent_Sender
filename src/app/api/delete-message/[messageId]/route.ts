import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { messageId: string } }
) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!session || !user) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const { messageId } = params;

    const updateMessageResult = await UserModel.findOneAndUpdate(
      { _id: user._id },
      { $pull: { messages: { _id: messageId } } },
      { new: true }
    );

    if (!updateMessageResult) {
      return NextResponse.json(
        { success: false, message: "Message not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Message deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error while deleting user messages", error);
    return NextResponse.json(
      { success: false, message: "Error while deleting user messages" },
      { status: 500 }
    );
  }
}
