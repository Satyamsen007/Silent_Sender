import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from "next-auth/providers/google";
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import GitHubProvider from "next-auth/providers/github";

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        username: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await dbConnect();
        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { userName: credentials.identifier }
            ]
          })
          if (!user) {
            throw new Error('No User found with this email address')
          }
          if (!user.isVerified) {
            throw new Error('Please verify your account first')
          }
          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
          if (isPasswordCorrect) {
            return user;
          } else {
            throw new Error('Incorrect password')
          }
        } catch (err) {
          throw new Error(err)
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          redirect_uri: process.env.NEXTAUTH_URL + "/api/auth/callback/google",
        }
      }
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        await dbConnect();
        try {
          let existingUser = await UserModel.findOne({ email: user?.email });
          const isVerified = profile?.email_verified ?? false;
          const expiryDate = new Date();
          expiryDate.setHours(expiryDate.getHours() + 1);
          const verifieCode = Math.floor(100000 + Math.random() * 900000).toString();
          const randomPassword = Math.random().toString(36).slice(-8);
          const hashedPassword = await bcrypt.hash(randomPassword, 10);
          const avatarUrl = profile?.image?.trim() || user?.image?.trim() || null;
          
          if (!existingUser) {
            existingUser = new UserModel({
              userName: user?.name?.split(' ').join('_'),
              email: user.email,
              password: hashedPassword,
              verifyCode: verifieCode,
              verifyCodeExpiry: expiryDate,
              avatar: avatarUrl,
              isVerified,
              isAcceptingMessage: true,
              messages: []
            })
            await existingUser.save();
          } else {
            if (!existingUser.avatar && avatarUrl) {
              existingUser.avatar = avatarUrl;
              await existingUser.save()
            }
          }
          user._id = existingUser?._id?.toString() || '';
          user.email = existingUser.email;
          user.userName = existingUser.userName;
          user.isVerified = existingUser.isVerified;
          user.isAcceptingMessages = existingUser.isAcceptingMessage;
          user.avatar = existingUser.avatar;
          return true;
        } catch (error) {
          console.error('Error while sign in with google', error)
          return '/error?message=Sign-in failed';
        }
      } else if (account?.provider === 'github') {
        await dbConnect();
        try {
          let existingUser = await UserModel.findOne({ email: user?.email });
          const expiryDate = new Date();
          expiryDate.setHours(expiryDate.getHours() + 1);
          const verifieCode = Math.floor(100000 + Math.random() * 900000).toString();
          const randomPassword = Math.random().toString(36).slice(-8);
          const hashedPassword = await bcrypt.hash(randomPassword, 10);
          const avatarUrl = profile?.image?.trim() || user?.image?.trim() || null;
          
          if (!existingUser) {
            existingUser = new UserModel({
              userName: user?.name?.split(' ').join('_'),
              email: user.email,
              password: hashedPassword,
              verifyCode: verifieCode,
              avatar: avatarUrl,
              verifyCodeExpiry: expiryDate,
              isVerified: true,
              isAcceptingMessage: true,
              messages: []
            })
            await existingUser.save();
          } else {
            if (!existingUser.avatar && avatarUrl) {
              existingUser.avatar = avatarUrl;
              await existingUser.save()
            }
          }
          user._id = existingUser?._id?.toString() || '';
          user.email = existingUser.email;
          user.userName = existingUser.userName;
          user.isVerified = existingUser.isVerified;
          user.isAcceptingMessages = existingUser.isAcceptingMessage;
          user.avatar = existingUser.avatar;
          return true;
        } catch (error) {
          console.error('Error while sign in with google', error)
          return '/error?message=Sign-in failed';
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id
        session.user.email = token.email
        session.user.isVerified = token.isVerified
        session.user.isAcceptingMessages = token.isAcceptingMessages
        session.user.userName = token.userName
        session.user.avatar = token.avatar
      }
      return session
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update') {
        return { ...token, ...session.user }
      }
      if (user) {
        token._id = user._id?.toString()
        token.email = user.email
        token.isVerified = user.isVerified
        token.userName = user.userName
        token.isAcceptingMessages = user.isAcceptingMessages
        token.avatar = user.avatar || user.image || ''
      }
      return token
    }
  },
  pages: {
    signIn: '/sign-in',
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET_KEY,
}