import { v2 as cloudinary } from 'cloudinary';

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const uploadToCloudinary = async (base64Data) => {
  try {
    if (!base64Data) return null;
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: 'SilentSender/user_avatars',
      resource_type: 'image',
      access_mode: 'public'
    });
    return result;
  } catch (error) {
    console.log('Error while uploading image to cloudinary', error);
    return null;
  }
}

export { uploadToCloudinary };
