import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
    applyJob,
    getApplicants,
    getAppliedJobs,
    updateStatus
} from "../controller/application.controller.js";

const router = express.Router();

router.post("/application/:job_id", isAuthenticated, applyJob);
router.get("/application", isAuthenticated, getAppliedJobs);
router.get("/application/:job_id/applicants", isAuthenticated, getApplicants);
router.patch("/application/:id/status", isAuthenticated, updateStatus);

export default router;