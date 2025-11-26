// middlewares/uploadComplaintPhoto.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('UPLOAD DEBUG: destination called. uploadsDir =', uploadsDir);
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const finalName = uniqueSuffix + path.extname(file.originalname);
    console.log('UPLOAD DEBUG: filename called. original:', file.originalname, 'final:', finalName);
    cb(null, finalName);
  },
});


// Filter only images/videos
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'video/mp4'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images and mp4 videos are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

// Export as middleware
const uploadComplaintPhoto = upload.single('photo'); // <-- matches "photo" in ComplaintForm.jsx

module.exports = uploadComplaintPhoto;
