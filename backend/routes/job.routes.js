import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
    getAdminJobs,
    getAllJobs,
    getJobById,
    postJob
} from "../controller/job.controller.js";

const router = express.Router();

router.post("/job/post", isAuthenticated, postJob);
router.get("/job/get", getAllJobs); // Removed auth for public access
router.get("/job/admin", isAuthenticated, getAdminJobs);
router.get("/job/:id", getJobById); // Public access

export default router;