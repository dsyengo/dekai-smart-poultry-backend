import Chatbot from "../models/chatbot.js";
import { chatbotResponse } from "../services/chatbotService.js";
import sanitize from "sanitize-html";

/**
 * @desc Send user message → get AI response → store both in the active session
 * @route POST /api/chat/send
 */
export const sendAIMessage = async (req, res) => {
    try {
        const { userId, message } = req.body;

        if (!userId || !message?.trim()) {
            return res.status(400).json({
                success: false,
                message: "User ID and message are required.",
            });
        }

        // Sanitize message to prevent XSS/injections
        const sanitizedMessage = sanitize(message, { allowedTags: [], allowedAttributes: {} });

        // Find or create active session for the user
        let session = await Chatbot.findOne({ userId }).sort({ createdAt: -1 });

        if (!session) {
            session = new Chatbot({
                userId,
                featureType: "chatbot",
                sessionStart: new Date(),
                chatbotData: { chatbotFlag: true, conversation: [] },
            });
        }

        // Append user's message
        session.chatbotData.conversation.push({
            role: "user",
            message: sanitizedMessage,
            timestamp: new Date(),
        });

        // Get AI response from Huawei LLM
        const aiReply = await chatbotResponse(sanitizedMessage);

        // Append bot response
        session.chatbotData.conversation.push({
            role: "bot",
            message: aiReply,
            timestamp: new Date(),
        });

        // Update session end and duration
        session.sessionEnd = new Date();
        session.duration = Math.floor((session.sessionEnd - session.sessionStart) / 1000);

        // Save updated session
        await session.save();

        res.status(201).json({
            success: true,
            message: "AI response generated successfully.",
            data: {
                userMessage: sanitizedMessage,
                botResponse: aiReply,
                sessionId: session._id,
            },
        });
    } catch (error) {
        console.error("Error in sendAIMessage:", error);
        res.status(500).json({
            success: false,
            message: "Error generating AI response.",
            error: error.message,
        });
    }
};

/**
 * @desc Get chat history (all sessions) for a user
 * @route GET /api/chat/history?userId=123
 */
export const getChatHistory = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required.",
            });
        }

        const sessions = await Chatbot.find({ userId }).sort({ createdAt: -1 });

        if (!sessions.length) {
            return res.status(404).json({
                success: false,
                message: "No chat history found for this user.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Chat history fetched successfully.",
            data: sessions,
        });
    } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching chat history.",
            error: error.message,
        });
    }
};

/**
 * @desc Clear all chatbot sessions for a user
 * @route DELETE /api/chat/clear
 */
export const clearChatHistory = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required.",
            });
        }

        await Chatbot.deleteMany({ userId });

        res.status(200).json({
            success: true,
            message: "Chat history cleared successfully.",
        });
    } catch (error) {
        console.error("Error clearing chat history:", error);
        res.status(500).json({
            success: false,
            message: "Error clearing chat history.",
            error: error.message,
        });
    }
};
