import express from "express";
import multer from "multer";
import path from "path";
import { userAuth } from "../middleware/userAuth.js";
import {
    uploadAndAnalyze,
    getAllAnalyses,
    getFarmAnalyses,
} from "../controllers/analysisController.js";

const router = express.Router();

// Configure Multer for local storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    },
});
const upload = multer({ storage });

// Routes
router.post("/upload", userAuth, upload.single("image"), uploadAndAnalyze);
router.get("/", userAuth, getAllAnalyses);
router.get("/farm/:farmId", userAuth, getFarmAnalyses);

export default router;
