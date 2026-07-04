"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadStream = void 0;
const cloudinary_1 = require("cloudinary");
const streamifier_1 = __importDefault(require("streamifier"));
// 1. Configure Cloudinary with your environment variables
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// 2. Create and export the upload helper function
const uploadStream = (buffer, folderName) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_stream({ folder: folderName }, (error, result) => {
            if (result)
                resolve(result);
            else
                reject(error);
        });
        // Convert the memory buffer into a readable stream and pipe it to Cloudinary
        streamifier_1.default.createReadStream(buffer).pipe(stream);
    });
};
exports.uploadStream = uploadStream;
// 3. Export the configured cloudinary instance as default 
// (Useful if you need to use cloudinary directly in other parts of your app)
exports.default = cloudinary_1.v2;
