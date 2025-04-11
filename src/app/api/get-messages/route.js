import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import mongoose from 'mongoose';

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);

  const user = session?.user;
  if (!session || !session.user) {
    return Response.json({
      success: false,
      message: 'Not authenticated'
    }, { status: 402 });
  }

  const userId = new mongoose.Types.ObjectId(user._id);

  try {
    const user = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: "$messages" },
      { $sort: { 'messages.createdAt': -1 } },
      { $group: { _id: '$_id', messages: { $push: '$messages' } } }
    ]);

    if (!user || user.length === 0) {
      return Response.json({
        success: false,
        message: 'No message found'
      }, { status: 404 });
    }

    return Response.json({
      success: true,
      messages: user[0]?.messages || [],
    }, { status: 200 });

  } catch (error) {
    console.error('Error while fetching user messages', error);
    return Response.json({
      success: false,
      message: 'Error while fetching user messages'
    }, { status: 500 });
  }
}