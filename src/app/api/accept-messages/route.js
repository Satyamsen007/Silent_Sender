import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

export async function POST(req) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!session || !session.user) {
    return Response.json({
      success: false,
      message: 'Not authenticated'
    }, { status: 300 })
  }
  const userId = user._id;
  const { acceptMessages } = await req.json();

  try {
    const updatedUser = await UserModel.findByIdAndUpdate({ _id: userId }, { isAcceptingMessage: acceptMessages }, { new: true });
    if (!updatedUser) {
      return Response.json({
        success: false,
        message: 'Failed to update user status to accept messages'
      }, { status: 401 })
    } else {
      return Response.json({
        success: true,
        message: 'Message status updated successfully',
        updatedUser
      }, { status: 201 })
    }

  } catch (error) {
    console.log('Failed to update user status to accepte messages', error);
    return Response.json({
      success: false,
      message: 'Failed to update user status to accept messages'
    }, { status: 500 })
  }
}

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!session || !session.user) {
    return Response.json({
      success: false,
      message: 'Not authenticated'
    }, { status: 300 })
  }
  const userId = user._id;
  try {
    const foundUser = await UserModel.findOne({ _id: userId });
    if (!foundUser) {
      return Response.json({
        success: false,
        message: 'User not found'
      }, { status: 401 })
    } else {
      return Response.json({
        success: true,
        message: 'User retrieved successfully',
        isAcceptingMessage: foundUser.isAcceptingMessage,
      }, { status: 200 })
    }
  } catch (error) {
    console.log('Error While get user isAccepyingMessages Status', error);
    return Response.json({
      success: false,
      message: 'Error While get user isAccepyingMessages Status',
    }, { status: 500 })
  }
}