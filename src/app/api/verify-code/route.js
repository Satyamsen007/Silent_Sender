import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(req) {
  await dbConnect();
  try {
    const { userName, code } = await req.json();
    const decodedUserName = decodeURIComponent(userName);
    const user = await UserModel.findOne({ userName: decodedUserName });
    if (!user) {
      return Response.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }
    if (!code || !/^\d+$/.test(code.trim())) {
      return Response.json({
        success: false,
        message: 'Invalid verification code. Only numbers are allowed.'
      }, { status: 404 });
    }
    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();
      return Response.json({
        success: true,
        message: 'Account verified successfully'
      }, { status: 200 });
    } else if (!isCodeNotExpired) {
      return Response.json({
        success: false,
        message: 'Verification code has expired pls signUp again to get a new code'
      }, { status: 400 });
    } else {
      return Response.json({
        success: false,
        message: 'Incorrect Verification Code'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error while verifying user', error);
    return Response.json({
      success: false,
      message: 'Error while verifying user'
    }, { status: 500 });
  }
}