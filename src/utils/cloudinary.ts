import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// 1. Configure Cloudinary with your environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Create and export the upload helper function
export const uploadStream = (buffer: Buffer, folderName: string) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folderName },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    
    // Convert the memory buffer into a readable stream and pipe it to Cloudinary
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// 3. Export the configured cloudinary instance as default 
// (Useful if you need to use cloudinary directly in other parts of your app)
export default cloudinary;