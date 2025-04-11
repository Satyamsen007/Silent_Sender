import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(req) {
  await dbConnect();
  try {
    const { username, email, password } = await req.json();
    
    // Check for existing verified user with same username
    const exitingUserVerifiedByUser = await UserModel.findOne({ 
      userName: username, 
      isVerified: true 
    });
    
    if (exitingUserVerifiedByUser) {
      return Response.json({
        success: false,
        message: 'User already exists and is verified by you'
      }, { status: 400 });
    }

    const existingUserByEmail = await UserModel.findOne({ email });
    const verifieCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json({
          success: false,
          message: 'User already exists with this email address',
        }, { status: 400 });
      } else {
        // Update existing unverified user
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifieCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existingUserByEmail.save();
      }
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
      
      const newUser = new UserModel({
        userName: username,
        email,
        password: hashedPassword,
        verifyCode: verifieCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: []
      });
      await newUser.save();
    }

    // Send verification email
    const emailResponse = await sendVerificationEmail(email, username, verifieCode);
    if (!emailResponse.success) {
      return Response.json({
        success: false,
        message: emailResponse.message,
      }, { status: 500 });
    }

    return Response.json({
      success: true,
      message: 'User registered successfully. Please verify your email address',
    }, { status: 201 });

  } catch (error) {
    console.error('Error while registering user', error);
    return Response.json({
      success: false,
      message: 'Error while registering user'
    }, { status: 500 });
  }
}