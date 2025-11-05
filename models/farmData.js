import mongoose from "mongoose";

const farmSchema = new mongoose.Schema(
    {
        // 🔹 Farmer reference (link to the user who owns the farm)
        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // 🔹 Basic Farm Identification
        farmName: {
            type: String,
            required: true,
            trim: true,
        },
        dateRegistered: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
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

        // 🔹 IoT Device Info (Optional)
        iotDevice: {
            deviceId: { type: String },
            deviceName: { type: String },
            activationKey: { type: String },
            lastSync: { type: Date },
            sensors: [
                {
                    type: {
                        type: String, // e.g., temperature, humidity, ammonia
                    },
                    latestValue: Number,
                    unit: String,
                    lastUpdated: Date,
                },
            ],
        },

        // 🔹 Farm Performance Metrics
        averageTemperature: { type: Number },
        averageHumidity: { type: Number },
        feedConsumptionRate: { type: Number },
        eggProductionRate: { type: Number },
        growthRate: { type: Number },
        healthStatus: { type: String },

        // 🔹 Alerts and Notifications
        alertPreferences: {
            type: String,
            enum: ["SMS", "WhatsApp", "App"],
            default: "App",
        },
        lastAlertSent: { type: Date },
        criticalAlerts: [
            {
                title: String,
                message: String,
                createdAt: { type: Date, default: Date.now },
            },
        ],

        // 🔹 Metadata
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true, // auto-manages createdAt & updatedAt
    }
);

export default mongoose.model("Farm", farmSchema);
