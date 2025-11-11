import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

/**
 * Get local image URL from Multer upload
 */
export const getImageUrl = (file) => {
    if (!file) throw new Error("No image file provided.");

    // Return local file path from Multer
    return `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${file.filename}`;
};

/**
 * Send image and sensor data to Huawei ModelArts for comprehensive analysis
 */
export const analyzeScanData = async (imageUrl, sensorData, location) => {
    try {
        const payload = {
            image_url: imageUrl,
            environmental_data: {
                temperature: sensorData.temperature,
                humidity: sensorData.humidity,
                ammonia: sensorData.nh4,
                co2: sensorData.co2,
                pm25: sensorData.pm25
            },
            location: location,
            timestamp: new Date().toISOString()
        };

        const response = await axios.post(
            process.env.HUAWEI_MODELARTS_ENDPOINT, // Your ModelArts inference endpoint
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Auth-Token": process.env.HUAWEI_CLOUD_TOKEN,
                },
                timeout: 30000 // 30 seconds timeout for AI processing
            }
        );

        // Map Huawei ModelArts response to our schema
        const aiResponse = response.data;

        return {
            scanData: {
                cameraFlag: true,
                environment: sensorData,
                location: location,
                diseaseDetection: {
                    detected: aiResponse.disease_detected || false,
                    prediction: aiResponse.predicted_disease || "No disease detected",
                    confidence: aiResponse.confidence_score || 0,
                    riskIndex: aiResponse.risk_index || 0
                }
            },
            analysisResult: {
                diseaseName: aiResponse.predicted_disease,
                confidence: aiResponse.confidence_score,
                riskLevel: calculateRiskLevel(aiResponse.risk_index),
                recommendations: generateRecommendations(aiResponse),
                preventiveMeasures: aiResponse.preventive_measures || [],
                treatmentOptions: {
                    conventional: aiResponse.conventional_treatments || [],
                    indigenous: aiResponse.indigenous_remedies || []
                }
            }
        };
    } catch (error) {
        console.error("Huawei AI analysis failed:", error.message);

        // Fallback response if AI service is down
        return getFallbackAnalysis();
    }
};

/**
 * Calculate risk level based on risk index (0-100)
 */
const calculateRiskLevel = (riskIndex) => {
    if (riskIndex >= 80) return "critical";
    if (riskIndex >= 60) return "high";
    if (riskIndex >= 40) return "medium";
    return "low";
};

/**
 * Generate actionable recommendations based on AI response
 */
const generateRecommendations = (aiResponse) => {
    const recommendations = [];

    if (aiResponse.disease_detected) {
        recommendations.push({
            action: "Isolate sick birds immediately",
            priority: "immediate",
            description: "Prevent disease spread to healthy flock"
        });

        recommendations.push({
            action: "Use DEKAI app for treatment guidance",
            priority: "high",
            description: "Follow recommended treatment protocol"
        });
    }

    if (aiResponse.environment_alert) {
        recommendations.push({
            action: "Improve ventilation",
            priority: "medium",
            description: "High ammonia levels detected"
        });
    }

    return recommendations;
};

/**
 * Fallback analysis when AI service is unavailable
 */
const getFallbackAnalysis = () => {
    return {
        scanData: {
            cameraFlag: true,
            diseaseDetection: {
                detected: false,
                prediction: "Analysis unavailable",
                confidence: 0,
                riskIndex: 0
            }
        },
        analysisResult: {
            diseaseName: "Service temporarily unavailable",
            confidence: 0,
            riskLevel: "low",
            recommendations: [{
                action: "Retry scan later",
                priority: "medium",
                description: "AI service is currently unavailable"
            }],
            preventiveMeasures: ["Maintain clean coop", "Ensure proper ventilation"],
            treatmentOptions: {
                conventional: [],
                indigenous: []
            }
        }
    };
};