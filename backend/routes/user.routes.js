import express from "express";
import {
    login,
    logout,
    register,
    updateProfile
} from "../controller/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { profilePhotoUpload, userUpdateUpload} from "../middlewares/multer.js";

const router = express.Router();

router.post("/register", profilePhotoUpload, register);
router.post("/login", login);
router.get("/logout", logout);
router.put("/profile/update", isAuthenticated, userUpdateUpload, updateProfile);

export default router;