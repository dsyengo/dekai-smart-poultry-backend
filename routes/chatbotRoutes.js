import express from "express";
import {
    sendAIMessage,
    getChatHistory,
    clearChatHistory,
} from "../controllers/chatbotController.js";
import { userAuth } from "../middleware/userAuth.js";

const router = express.Router();

router.post("/send", userAuth, sendAIMessage);
router.get("/history", userAuth, getChatHistory);
router.delete("/clear", userAuth, clearChatHistory);

export default router;
