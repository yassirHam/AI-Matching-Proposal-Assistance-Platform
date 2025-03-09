import multer from "multer";

const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

export const singleUpload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).single("file");