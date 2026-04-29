const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with your credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage config for course thumbnails (images)
const thumbnailStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'coursevo/thumbnails',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 450, crop: 'fill' }], // enforce 16:9
  },
});

// Storage config for lesson videos
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'coursevo/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi'],
  },
});

// multer middleware — use these in your routes
const uploadThumbnail = multer({ storage: thumbnailStorage });
const uploadVideo    = multer({ storage: videoStorage });

// Helper to delete a file from Cloudinary by its public_id
const deleteFile = async (publicId, resourceType = 'image') => {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

module.exports = { uploadThumbnail, uploadVideo, deleteFile };