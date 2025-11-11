import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "assistant"],
        required: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
export default ChatMessage;
