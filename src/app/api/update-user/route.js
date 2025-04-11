import UserModel from "@/model/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { uploadToCloudinary } from "@/helpers/uploadToCloudenary";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import { v2 as cloudinary } from 'cloudinary';

export async function PUT(req) {
  try {
    await dbConnect();
    const { username, newPassword, avatar } = await req.json();

    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!session || !session.user) {
      return NextResponse.json({
        success: false,
        message: "Not authenticated",
      }, { status: 401 });
    }

    const updateFields = {};

    if (username) {
      updateFields.userName = username;
    }

    if (newPassword) {
      updateFields.password = await bcrypt.hash(newPassword, 10);
    }

    if (avatar) {
      const match = avatar.match(/^data:image\/([a-zA-Z]+);base64,/);
      const ext = match ? match[1] : "png";

      const base64Data = avatar.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const fileName = `avatar-${Date.now()}.${ext}`;
      const filePath = `./public/temp/${fileName}`;

      // Find user and get existing Cloudinary avatar
      const existingUser = await UserModel.findById(session.user._id);
      if (existingUser?.avatar) {
        const publicId = existingUser.avatar.slice(62, -4);
        if (publicId) {
          await cloudinary.api.delete_resources([publicId]);
        }
      }

      await writeFile(filePath, buffer);
      const uploadedAvatar = await uploadToCloudinary(filePath);
      if (uploadedAvatar) {
        updateFields.avatar = uploadedAvatar.secure_url;
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({
        success: false,
        message: "No changes provided",
      }, { status: 400 });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      { _id: user._id },
      { $set: updateFields },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: updatedUser?._id,
        userName: updatedUser?.userName,
        avatar: updatedUser?.avatar,
        email: updatedUser?.email
      },
    }, { status: 200 });

  } catch (error) {
    console.error('Error while updating user profile', error);
    return NextResponse.json({
      success: false,
      message: 'Error while updating user profile',
      error: error
    }, { status: 500 });
  }
}