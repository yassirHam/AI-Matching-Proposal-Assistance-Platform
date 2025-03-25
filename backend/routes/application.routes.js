import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
    applyJob,
    getApplicants,
    getAppliedJobs,
    updateStatus
} from "../controller/application.controller.js";

const router = express.Router();
router.get("/get", isAuthenticated, getAppliedJobs);
router.post("/application/:job_id", isAuthenticated, applyJob);
router.get("/:job_id/applicants", isAuthenticated, getApplicants);
router.patch("/:id/status", isAuthenticated, updateStatus);

export default router;