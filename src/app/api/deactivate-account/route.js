import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import { v2 as cloudinary } from 'cloudinary';

export async function DELETE() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!session || !session.user) {
    return NextResponse.json({
      success: false,
      message: 'Not authenticated'
    }, { status: 401 });
  }

  const existingUser = await UserModel.findOne({ _id: user._id });

  if (!existingUser) {
    return NextResponse.json({
      success: false,
      message: 'User not found or Does not exist'
    }, { status: 404 });
  }

  // Delete avatar if exists
  if (existingUser?.avatar) {
    try {
      const imageUrl = existingUser.avatar;
      const parts = imageUrl.split('/');
      const fileNameWithExt = parts[parts.length - 1];
      const publicId = fileNameWithExt.split('.')[0];

      if (publicId) {
        await cloudinary.api.delete_resources([`SilentSender/user_avatars/${publicId}`]);
      }
    } catch (error) {
      console.error("Cloudinary delete error: ", error);
    }
  }

  await UserModel.findByIdAndDelete(existingUser._id);

  const response = NextResponse.json({
    success: true,
    message: 'User deleted successfully'
  }, { status: 200 });

  response.cookies.set("next-auth.session-token", "", { maxAge: 0 });
  response.cookies.set("next-auth.csrf-token", "", { maxAge: 0 });

  return response;
}
