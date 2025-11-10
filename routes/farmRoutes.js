import express from "express";
import {
    addFarm,
    getFarms,
    checkFarmCompletion,
    updateFarm,
    deleteFarm,
} from "../controllers/farmController.js";
import { userAuth } from "../middleware/userAuth.js";

const router = express.Router();

// ✅ All routes require authentication
router.post("/add-farm", userAuth, addFarm);                 // Add farm data
router.get("/get-farms", userAuth, getFarms);                 // Fetch all farms for logged-in user
router.get("/check-completion", userAuth, checkFarmCompletion); // Check onboarding completion
router.put("/:id", userAuth, updateFarm);            // Update farm data
router.delete("/:id", userAuth, deleteFarm);         // Delete farm data

export default router;
