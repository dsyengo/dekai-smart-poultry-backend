import DiseaseAnalysis from "../models/DiseaseAnalysis.js";
import { uploadImage, analyzeImage } from "../services/analysisService.js";

/**
 * @desc Upload image and analyze it
 * @route POST /api/v1/analysis
 * @access Private
 */
export const uploadAndAnalyze = async (req, res) => {
    try {
        const { farmId } = req.body;
        const farmerId = req.body.userId;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No image uploaded." });
        }

        // Step 1: Upload image
        const imageUrl = await uploadImage(req.file);

        // Step 2: Create a pending record
        const analysisRecord = await DiseaseAnalysis.create({
            farmerId,
            farmId,
            imageUrl,
            status: "pending",
        });

        // Step 3: Call Huawei AI service
        const result = await analyzeImage(imageUrl);

        // Step 4: Update record
        analysisRecord.analysisResult = result;
        analysisRecord.status = "completed";
        await analysisRecord.save();

        // Step 5: Respond to mobile app
        res.status(200).json({
            success: true,
            message: "Analysis completed successfully",
            data: analysisRecord,
        });
    } catch (error) {
        console.error("Error in uploadAndAnalyze:", error);
        res.status(500).json({
            success: false,
            message: "Image analysis failed",
            error: error.message,
        });
    }
};

/**
 * @desc Get all analyses for a farmer
 * @route GET /api/analysis
 * @access Private
 */
export const getAllAnalyses = async (req, res) => {
    try {
        const farmerId = req.body.userId;

        const analyses = await DiseaseAnalysis.find({ farmerId })
            .populate("farmId", "farmName poultryType")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: analyses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc Get analyses by farm ID
 * @route GET /api/analysis/farm/:farmId
 * @access Private
 */
export const getFarmAnalyses = async (req, res) => {
    try {
        const farmerId = req.body.userId;
        const { farmId } = req.params;

        const analyses = await DiseaseAnalysis.find({ farmerId, farmId }).sort({
            createdAt: -1,
        });

        res.status(200).json({ success: true, data: analyses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


