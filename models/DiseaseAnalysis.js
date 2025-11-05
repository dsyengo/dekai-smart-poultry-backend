import mongoose from "mongoose";

const diseaseAnalysisSchema = new mongoose.Schema(
    {
        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        farmId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Farm",
            required: true,
        },
        imageUrl: {
            type: String,
            required: true,
        },
        analysisResult: {
            diseaseName: { type: String },
            confidence: { type: Number },
            recommendation: { type: String },
        },
        status: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "pending",
        },
    },
    { timestamps: true }
);

export default mongoose.model("DiseaseAnalysis", diseaseAnalysisSchema);
