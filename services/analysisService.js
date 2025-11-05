import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

/**
 * Upload image to cloud (or local)
 * For now, we assume the file path from Multer is used directly.
 */
export const uploadImage = async (file) => {
    if (!file) throw new Error("No image file provided.");
    // In production, integrate Cloudinary, S3, or Huawei OBS.
    return `${process.env.BASE_URL}/uploads/${file.filename}`;
};

/**
 * Send image URL to Huawei Cloud AI endpoint for analysis
 * (You will plug in your real endpoint below)
 */
export const analyzeImage = async (imageUrl) => {
    try {
        const response = await axios.post(
            process.env.HUAWEI_AI_ENDPOINT, // Your inference endpoint
            { imageUrl },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.HUAWEI_AI_TOKEN}`, // optional
                },
            }
        );

        // Assume Huawei response structure:
        return {
            diseaseName: response.data?.disease || "Unknown",
            confidence: response.data?.confidence || 0,
            recommendation:
                response.data?.recommendation ||
                "No recommendation provided by the model.",
        };
    } catch (error) {
        console.error("AI analysis failed:", error.message);
        throw new Error("AI service unavailable");
    }
};
