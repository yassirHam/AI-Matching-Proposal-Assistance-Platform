import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Ensure the uploads directory exists
const uploadDir = path.join(process.cwd(), 'tmp', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Save files to the uploads directory
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// File filter to allow only specific file types
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'application/pdf', // PDF files
        'application/msword', // DOC files
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX files
        'image/jpeg', // JPEG images
        'image/png' // PNG images
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF, DOC, DOCX, JPEG, and PNG files are allowed'), false);
    }
};

// Export Multer middleware for single file uploads
export const singleUpload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1
    },
    fileFilter
}).single('resume'); // Allow only the 'resume' field