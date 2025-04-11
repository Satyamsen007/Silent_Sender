import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET() {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    const authenticateUser = session?.user;
    
    if (!authenticateUser) {
      return NextResponse.json({
        success: false,
        message: 'Not authenticated please go and log in first.'
      }, { status: 401 });
    }

    const findAllUsers = await UserModel.find({ 
      _id: { $ne: authenticateUser._id } 
    }).select('-password -verifyCode -verifyCodeExpiry -isVerified -messages');

    if (findAllUsers.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No users found!'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      users: findAllUsers
    }, { status: 200 });

  } catch (error) {
    console.log('Error while get all users: ', error);
    return NextResponse.json({
      success: false,
      message: 'Error while getting all users'
    }, { status: 501 });
  }
}