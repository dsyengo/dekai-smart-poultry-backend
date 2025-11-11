import { chatbotResponse } from "../services/chatbotService.js";
import ChatMessage from "../models/chatbot.js";
import sanitize from "sanitize-html";

/**
 * @desc Send user message → get AI response → store both in DB
 * @route POST /api/chat/send
 */
export const sendAIMessage = async (req, res) => {
    try {
        const { message, userId } = req.body;
        // const  userId  = req.body.userId;
        console.log(`ChatBOt User id: ${req.body.userId}`)


        // 🔒 Validation
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required.",
            });
        }

        if (!message || typeof message !== "string" || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Message must be a non-empty string.",
            });
        }

        // 🧹 Sanitize input to prevent XSS or injections
        const sanitizedMessage = sanitize(message, {
            allowedTags: [],
            allowedAttributes: {},
        });

        // 💾 Save user message
        const userChat = new ChatMessage({
            userId,
            role: "user",
            message: sanitizedMessage,
        });
        await userChat.save();

        // 🤖 Get AI response from LLM service
        const aiReply = await chatbotResponse(sanitizedMessage);

        // 💾 Save assistant's reply
        const assistantChat = new ChatMessage({
            userId,
            role: "assistant",
            message: aiReply,
        });
        await assistantChat.save();

        // ✅ Send combined response
        res.status(201).json({
            success: true,
            message: "AI response generated successfully.",
            data: {
                user: sanitizedMessage,
                assistant: aiReply,
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
 * @desc Get chat history for a user
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

        // Fetch latest 50 messages sorted (newest first)
        const chatHistory = await ChatMessage.find({ userId })
            .sort({ timestamp: -1 })
            .limit(50);

        if (!chatHistory.length) {
            return res.status(404).json({
                success: false,
                message: "No chat history found for this user.",
            });
        }

        // Reverse for chronological order (oldest first)
        res.status(200).json({
            success: true,
            message: "Chat history fetched successfully.",
            data: chatHistory.reverse(),
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
 * @desc Clear all chat messages for a user
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

        await ChatMessage.deleteMany({ userId });

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
