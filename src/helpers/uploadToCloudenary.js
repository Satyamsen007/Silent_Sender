import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const uploadToCloudinary = async (localpath) => {
  try {
    if (!localpath) return null;
    const result = await cloudinary.uploader.upload(localpath, {
      folder: 'SilentSender/user_avatars',
      resource_type: 'image',
      access_mode: 'public'
    });
    fs.unlinkSync(localpath);
    return result;
  } catch (error) {
    console.log('Error while uploading image to cloudinary', error);
    fs.unlinkSync(localpath);
    return null;
  }
}

export { uploadToCloudinary };