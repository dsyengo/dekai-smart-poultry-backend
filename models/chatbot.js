import mongoose from "mongoose";

const chatbotSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        featureType: {
            type: String,
            default: "chatbot",
        },
        sessionStart: {
            type: Date,
            default: Date.now,
        },
        sessionEnd: {
            type: Date,
        },
        duration: {
            type: Number, // duration in seconds
        },
        chatbotData: {
            chatbotFlag: {
                type: Boolean,
                default: true,
            },
            conversation: [
                {
                    role: {
                        type: String,
                        enum: ["user", "bot"],
                        required: true,
                    },
                    message: {
                        type: String,
                        required: true,
                    },
                    timestamp: {
                        type: Date,
                        default: Date.now,
                    },
                },
            ],
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false }, // adds "createdAt" only
    }
);

const Chatbot = mongoose.model("Chatbot", chatbotSchema);
export default Chatbot;
