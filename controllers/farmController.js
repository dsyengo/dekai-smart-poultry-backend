import Farm from "../models/farmData.js";

// ✅ Add new farm
export const addFarm = async (req, res) => {
    try {
        const farmerId = req.user.id; // from auth middleware
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

// ✅ Get all farms for logged-in farmer
export const getFarms = async (req, res) => {
    try {
        const farms = await Farm.find({ farmerId: req.user.id });
        res.status(200).json({ success: true, data: farms });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch farms" });
    }
};

// ✅ Check if farm data is complete
export const checkFarmCompletion = async (req, res) => {
    try {
        const farm = await Farm.findOne({ farmerId: req.user.id });

        if (!farm) return res.status(404).json({ message: "No farm found for this user." });

        const requiredFields = ["farmName", "county", "poultryType", "birdCount"];
        const isComplete = requiredFields.every((f) => farm[f]);

        // Update the field if changed
        if (farm.isDataComplete !== isComplete) {
            farm.isDataComplete = isComplete;
            await farm.save();
        }

        res.status(200).json({ success: true, isDataComplete: farm.isDataComplete });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error checking farm completion" });
    }
};

// ✅ Update farm data
export const updateFarm = async (req, res) => {
    try {
        const farm = await Farm.findOneAndUpdate(
            { _id: req.params.id, farmerId: req.user.id },
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

// ✅ Delete farm
export const deleteFarm = async (req, res) => {
    try {
        const farm = await Farm.findOneAndDelete({
            _id: req.params.id,
            farmerId: req.user.id,
        });

        if (!farm) return res.status(404).json({ message: "Farm not found" });

        res.status(200).json({ success: true, message: "Farm deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete farm" });
    }
};
