import multer from 'multer';

const allowedImageTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 5;

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  console.log('DEBUG: Middleware received file:', file.originalname, file.mimetype);
  try {
    if (!file) {
      console.error('DEBUG: No file provided to middleware');
      return cb(new Error('No file provided'), false);
    }

    if (!allowedImageTypes.includes(file.mimetype)) {
      console.error('DEBUG: Invalid file type:', file.mimetype);
      return cb(new Error('Only image files allowed (jpg, png, webp, gif)'), false);
    }

    cb(null, true);
  } catch (err) {
    console.error('DEBUG: Middleware error:', err);
    cb(new Error(`File validation failed: ${err.message}`), false);
  }
};

export default multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
  fileFilter,
}).array('images', MAX_FILES);