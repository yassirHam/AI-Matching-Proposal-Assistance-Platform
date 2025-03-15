import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Create upload directory if it doesn't exist
const uploadDir = path.join(process.cwd(), 'tmp', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// Filter for profile photos (JPEG/PNG only)
const profilePhotoFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (
        allowedMimeTypes.includes(file.mimetype) &&
        allowedExtensions.includes(ext)
    ) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG/PNG images allowed (max 5MB)'), false);
    }
};

// Filter for resumes (PDF/DOC/DOCX only)
const resumeFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (
        allowedMimeTypes.includes(file.mimetype) &&
        allowedExtensions.includes(ext)
    ) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF/DOC/DOCX files allowed (max 5MB)'), false);
    }
};

// Combined Multer middleware for handling profile photo and resume uploads
export const userUpdateUpload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'profile_photo') {
            profilePhotoFilter(req, file, cb);
        } else if (file.fieldname === 'resume') {
            resumeFilter(req, file, cb);
        } else {
            cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
        }
    }
}).fields([
    { name: 'profile_photo', maxCount: 1 }, // Allow 1 profile photo
    { name: 'resume', maxCount: 1 } // Allow 1 resume
]);

export const profilePhotoUpload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: profilePhotoFilter
}).single('profile_photo');

export const resumeUpload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: resumeFilter
}).single('resume');