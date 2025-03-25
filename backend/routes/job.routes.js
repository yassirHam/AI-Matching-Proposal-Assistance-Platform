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
router.get("/get", getAllJobs); // Removed auth for public access
router.get("/job/admin", isAuthenticated, getAdminJobs);
router.get("/:id", getJobById); // Public access

export default router;