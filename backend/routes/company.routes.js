import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
    getCompany,
    getCompanyById,
    registerCompany,
    updateCompany
} from "../controller/company.controller.js";
import {profilePhotoUpload} from "../middlewares/multer.js";

const router = express.Router();

router.post("/reg", isAuthenticated, registerCompany);
router.get("/log", isAuthenticated, getCompany);
router.get("/company/:id", isAuthenticated, getCompanyById);
router.put("/company/:id", isAuthenticated, profilePhotoUpload, updateCompany);

export default router;