import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configure with timeout
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60000
});

const uploadToCloudinary = async (localpath) => {
  try {
    // Validate input
    if (!localpath || !fs.existsSync(localpath)) {
      console.error('Invalid file path or file does not exist');
      return null;
    }

    // Verify file size
    const stats = fs.statSync(localpath);
    if (stats.size > 10 * 1024 * 1024) { // 10MB limit
      console.error('File too large');
      fs.unlinkSync(localpath);
      return null;
    }

    // Upload with error handling
    const result = await cloudinary.uploader.upload(localpath, {
      folder: 'SilentSender/user_avatars',
      resource_type: 'auto',
      access_mode: 'public'
    });

    // Clean up
    fs.unlinkSync(localpath);
    return result;

  } catch (error) {
    console.error('Upload failed:', error.message);
    
    // Attempt cleanup if file exists
    if (localpath && fs.existsSync(localpath)) {
      try {
        fs.unlinkSync(localpath);
      } catch (unlinkError) {
        console.error('Cleanup failed:', unlinkError);
      }
    }
    
    return null;
  }
};

export { uploadToCloudinary };