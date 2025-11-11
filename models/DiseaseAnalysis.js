import mongoose from "mongoose";

const diseaseAnalysisSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        farmId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Farm",
            required: true,
        },
        featureType: {
            type: String,
            enum: ["scan", "manual", "sensor"],
            default: "scan",
            required: true
        },
        sessionStart: {
            type: Date,
            required: true,
            default: Date.now
        },
        sessionEnd: {
            type: Date,
            required: true
        },
        duration: {
            type: Number, // in seconds
            required: true
        },
        scanData: {
            location: {
                latitude: { type: Number, required: true },
                longitude: { type: Number, required: true }
            },
            cameraFlag: {
                type: Boolean,
                required: true,
                default: false
            },
            imageUrl: {
                type: String,
                required: function () {
                    return this.scanData.cameraFlag === true;
                }
            },
            environment: {
                temperature: { type: Number },
                humidity: { type: Number },
                nh4: { type: Number }, // ammonia levels
                co2: { type: Number },
                pm25: { type: Number } // air quality
            },
            diseaseDetection: {
                detected: { type: Boolean, required: true },
                prediction: { type: String },
                confidence: { type: Number },
                riskIndex: { type: Number } // 0-100 scale
            }
        },
        analysisResult: {
            diseaseName: { type: String },
            confidence: { type: Number },
            riskLevel: {
                type: String,
                enum: ["low", "medium", "high", "critical"],
                default: "low"
            },
            recommendations: [{
                action: { type: String, required: true },
                priority: {
                    type: String,
                    enum: ["immediate", "high", "medium", "low"],
                    default: "medium"
                },
                description: { type: String }
            }],
            preventiveMeasures: [{ type: String }],
            treatmentOptions: {
                conventional: [{ type: String }],
                indigenous: [{ type: String }]
            }
        },
        status: {
            type: String,
            enum: ["pending", "processing", "completed", "failed"],
            default: "pending"
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Update the updatedAt field before saving
diseaseAnalysisSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Index for faster queries
diseaseAnalysisSchema.index({ userId: 1, createdAt: -1 });
diseaseAnalysisSchema.index({ farmId: 1, createdAt: -1 });
diseaseAnalysisSchema.index({ userId: 1, farmId: 1 });
diseaseAnalysisSchema.index({ "scanData.diseaseDetection.detected": 1 });
diseaseAnalysisSchema.index({ "analysisResult.riskLevel": 1 });

export default mongoose.model("DiseaseAnalysis", diseaseAnalysisSchema);