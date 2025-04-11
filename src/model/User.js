import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  }
});

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  avatar: {
    type: String,
  },
  verifyCode: {
    type: String,
    required: [true, 'Verify Code is required']
  },
  verifyCodeExpiry: {
    type: Date,
    required: [true, 'Verify Code Expiry is required']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isAcceptingMessage: {
    type: Boolean,
    default: true
  },
  messages: [MessageSchema]
});

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

export default UserModel;