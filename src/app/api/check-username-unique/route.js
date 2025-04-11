import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from 'zod';
import { userNameValidation } from "@/schemas/signUpSchema";

const userNameQuerySchema = z.object({
  userName: userNameValidation
})

export async function GET(req) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = {
      userName: searchParams.get('userName')
    }
    // Validate with zod
    const result = userNameQuerySchema.safeParse(queryParams);
    if (!result.success) {
      const userNameErrors = result.error.format().userName?._errors || [];
      return Response.json({
        success: false,
        message: 'Invalid username',
        errors: userNameErrors
      }, { status: 404 })
    }
    const { userName } = result.data;
    const existingVerifiedUser = await UserModel.findOne({ userName, isVerified: true });
    if (existingVerifiedUser) {
      return Response.json({
        success: false,
        message: 'UserName is already taken',
      }, { status: 404 })
    }
    return Response.json({
      success: true,
      message: 'UserName is unique',
    }, { status: 202 })
  } catch (error) {
    console.error('Error while checking userName', error);
    return Response.json({
      success: false,
      message: 'Error while checking userName'
    }, { status: 500 })
  }
}