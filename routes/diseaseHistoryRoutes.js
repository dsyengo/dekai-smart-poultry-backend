// routes/diseaseHistoryRoutes.js

import express from "express";
import { userAuth } from "../middleware/userAuth.js";
import {
    getScanHistory,
    getScanById,
    deleteScan,
    generateReport,
} from "../controllers/diseaseHistoryController.js";

const router = express.Router();

// ✅ Fetch all scans for a farmer
router.get("/", userAuth, getScanHistory);

// ✅ Fetch one scan by ID
router.get("/:id", userAuth, getScanById);

// ✅ Delete scan record
router.delete("/:id", userAuth, deleteScan);

// ✅ Generate a disease analysis report
router.get("/report/generate", userAuth, generateReport);

export default router;
