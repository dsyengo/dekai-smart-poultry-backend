import express from "express";
import multer from "multer";
import path from "path";
import { userAuth } from "../middleware/userAuth.js";
import {
    performDiseaseScan,
    getUserScanAnalyses,
    getScanAnalysis,
    getRiskAlerts
} from "../controllers/analysisController.js";

const router = express.Router();

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        // Validate image file types
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB file size limit
    }
});

// Scan Analysis Routes
router.post("/scan", userAuth, upload.single("image"), performDiseaseScan);
router.get("/scans", userAuth, getUserScanAnalyses);
router.get("/scans/:scanId", userAuth, getScanAnalysis);
router.get("/alerts", userAuth, getRiskAlerts);

// Legacy route for backward compatibility (if needed)
router.post("/upload", userAuth, upload.single("image"), performDiseaseScan);
router.get("/", userAuth, getUserScanAnalyses);

export default router;