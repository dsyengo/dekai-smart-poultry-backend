import Farm from "../models/farmData.js";

//  Add new farm
export const addFarm = async (req, res) => {
    try {
        const farmerId = req.body.userId;
        const existingFarm = await Farm.findOne({ farmerId });

        if (existingFarm) {
            return res.status(400).json({ message: "Farm already exists for this farmer." });
        }

        const newFarm = new Farm({ ...req.body, farmerId });
        await newFarm.save();

        res.status(201).json({
            success: true,
            message: "Farm data added successfully.",
            data: newFarm,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

//  Get all farms for logged-in farmer
export const getFarms = async (req, res) => {
    try {
        const farms = await Farm.find({ farmerId: req.body.userId });
        res.status(200).json({ success: true, data: farms });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch farms" });
    }
};

//  Check if farm data is complete for a specific farm
export const checkFarmCompletion = async (req, res) => {
    try {
        const { farmId } = req.params;

        // Find the farm by ID and ensure it belongs to the logged-in farmer
        const farm = await Farm.findOne({ _id: farmId, farmerId: req.body.userId });
        if (!farm) {
            return res.status(404).json({ success: true, message: "Farm not found for this user.", isDataFilled: false, });
        }

        // Minimal required fields to consider data "complete"
        const requiredFields = ["farmName", "county", "poultryType", "birdCount"];
        const isComplete = requiredFields.every(field => farm[field] !== undefined && farm[field] !== null && farm[field] !== "");

        // Update the field if it has changed
        if (farm.isDataFilled !== isComplete) {
            farm.isDataFilled = isComplete;
            await farm.save();
        }

        res.status(200).json({
            success: true,
            isDataFilled: farm.isDataFilled,
            message: isComplete ? "Farm data is complete." : "Farm data is incomplete.",
        });
    } catch (error) {
        console.error("Error checking farm completion:", error.message);
        res.status(500).json({ success: false, message: "Server error while checking farm completion." });
    }
};

//  Update farm data
export const updateFarm = async (req, res) => {
    try {
        const farm = await Farm.findOneAndUpdate(
            { _id: req.params.id, farmerId: req.body.userId },
            req.body,
            { new: true }
        );

        if (!farm) return res.status(404).json({ message: "Farm not found" });

        // Re-check completeness
        const requiredFields = ["farmName", "county", "poultryType", "birdCount"];
        const isComplete = requiredFields.every((f) => farm[f]);
        if (farm.isDataComplete !== isComplete) {
            farm.isDataComplete = isComplete;
            await farm.save();
        }

        res.status(200).json({ success: true, message: "Farm updated successfully", data: farm });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update farm" });
    }
};

//  Delete farm
export const deleteFarm = async (req, res) => {
    try {
        const farm = await Farm.findOneAndDelete({
            _id: req.params.id,
            farmerId: req.body.userId,
        });

        if (!farm) return res.status(404).json({ message: "Farm not found" });

        res.status(200).json({ success: true, message: "Farm deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete farm" });
    }
};
