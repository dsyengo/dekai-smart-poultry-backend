import DiseaseAnalysis from "../models/DiseaseAnalysis.js";
import { getImageUrl, analyzeScanData } from "../services/analysisService.js";

/**
 * @desc Upload image with sensor data and perform comprehensive analysis
 * @route POST /api/v1/analysis/scan
 * @access Private
 */
export const performDiseaseScan = async (req, res) => {
    let analysisRecord;

    try {
        const {
            farmId,
            latitude,
            longitude,
            temperature,
            humidity,
            nh4,
            co2,
            pm25
        } = req.body;

        const userId = req.user.id; // From auth middleware

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image uploaded."
            });
        }

        // Validate required location data
        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: "Location data (latitude, longitude) is required"
            });
        }

        const sessionStart = new Date();

        // Step 1: Get local image URL from Multer upload
        const imageUrl = getImageUrl(req.file);

        // Step 2: Prepare sensor data
        const sensorData = {
            temperature: parseFloat(temperature) || null,
            humidity: parseFloat(humidity) || null,
            nh4: parseFloat(nh4) || null,
            co2: parseFloat(co2) || null,
            pm25: parseFloat(pm25) || null
        };

        const location = {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude)
        };

        // Step 3: Create pending analysis record
        analysisRecord = await DiseaseAnalysis.create({
            userId,
            farmId,
            featureType: "scan",
            sessionStart,
            status: "processing",
            scanData: {
                location,
                cameraFlag: true,
                imageUrl,
                environment: sensorData
            }
        });

        // Step 4: Call Huawei AI service for comprehensive analysis
        const analysisResult = await analyzeScanData(imageUrl, sensorData, location);

        const sessionEnd = new Date();
        const duration = Math.round((sessionEnd - sessionStart) / 1000); // in seconds

        // Step 5: Update record with complete analysis
        analysisRecord.sessionEnd = sessionEnd;
        analysisRecord.duration = duration;
        analysisRecord.scanData = analysisResult.scanData;
        analysisRecord.analysisResult = analysisResult.analysisResult;
        analysisRecord.status = "completed";

        await analysisRecord.save();

        // Step 6: Respond with mobile-optimized format
        res.status(200).json({
            success: true,
            message: "Disease scan completed successfully",
            data: {
                scanId: analysisRecord._id,
                diseaseDetected: analysisResult.scanData.diseaseDetection.detected,
                prediction: analysisResult.scanData.diseaseDetection.prediction,
                confidence: analysisResult.scanData.diseaseDetection.confidence,
                riskLevel: analysisResult.analysisResult.riskLevel,
                immediateActions: analysisResult.analysisResult.recommendations
                    .filter(rec => rec.priority === "immediate")
                    .map(rec => rec.action),
                recommendations: analysisResult.analysisResult.recommendations,
                timestamp: analysisRecord.sessionEnd
            }
        });

    } catch (error) {
        console.error("Error in performDiseaseScan:", error);

        // Update record status to failed if it was created
        if (analysisRecord) {
            analysisRecord.status = "failed";
            await analysisRecord.save();
        }

        res.status(500).json({
            success: false,
            message: "Disease scan failed",
            error: error.message,
        });
    }
};

/**
 * @desc Get all scan analyses for a user
 * @route GET /api/v1/analysis/scans
 * @access Private
 */
export const getUserScanAnalyses = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;

        const analyses = await DiseaseAnalysis.find({
            userId,
            featureType: "scan"
        })
            .populate("farmId", "farmName location poultryType")
            .sort({ sessionStart: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await DiseaseAnalysis.countDocuments({
            userId,
            featureType: "scan"
        });

        res.status(200).json({
            success: true,
            data: analyses,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalScans: total
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc Get specific scan analysis by ID
 * @route GET /api/v1/analysis/scans/:scanId
 * @access Private
 */
export const getScanAnalysis = async (req, res) => {
    try {
        const { scanId } = req.params;
        const userId = req.user.id;

        const analysis = await DiseaseAnalysis.findOne({
            _id: scanId,
            userId
        }).populate("farmId", "farmName location poultryType");

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: "Scan analysis not found"
            });
        }

        res.status(200).json({
            success: true,
            data: analysis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc Get recent high-risk scans for dashboard
 * @route GET /api/v1/analysis/alerts
 * @access Private
 */
export const getRiskAlerts = async (req, res) => {
    try {
        const userId = req.user.id;

        const highRiskScans = await DiseaseAnalysis.find({
            userId,
            "analysisResult.riskLevel": { $in: ["high", "critical"] },
            "scanData.diseaseDetection.detected": true
        })
            .populate("farmId", "farmName location")
            .sort({ sessionStart: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            data: highRiskScans,
            alertCount: highRiskScans.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};