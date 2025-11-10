// models/Farm.js
import mongoose from "mongoose";

const farmSchema = new mongoose.Schema(
    {
        // 🔹 Farmer reference
        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },

        // 🔹 Basic Farm Identification
        farmName: {
            type: String,
            required: true,
            trim: true,
        },

        // 🔹 Location Information
        county: { type: String, required: true },
        subcounty: { type: String },
        village: { type: String },
        gps: {
            latitude: { type: Number },
            longitude: { type: Number },
        },
        altitude: { type: Number },

        // 🔹 Poultry Information
        poultryType: {
            type: String,
            enum: ["Broilers", "Layers", "Indigenous"],
            required: true,
        },
        birdCount: { type: Number, required: true },
        averageBirdAgeWeeks: { type: Number },
        productionStage: {
            type: String,
            enum: ["Chicks", "Growers", "Layers"],
        },
        feedType: { type: String },
        mortalityRate: { type: Number, default: 0 },

        // 🔹 Housing & Management
        housingType: {
            type: String,
            enum: ["Open", "Semi-Closed", "Closed"],
        },
        biosecurityPractices: [{ type: String }],
        cleaningFrequency: {
            type: String,
            enum: ["Daily", "Weekly", "Monthly"],
        },
        litterManagement: { type: String },
        ventilationQuality: { type: String },

        // 🔹 Metadata
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },

        // 🔹 Flag for data completeness
        isDataFilled: { type: Boolean, default: false },
    },
    {
        timestamps: true, // auto-manages createdAt & updatedAt
    }
);

export default mongoose.model("Farm", farmSchema);
