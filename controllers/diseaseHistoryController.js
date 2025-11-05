// controllers/diseaseHistoryController.js

import DiseaseScan from "../models/DiseaseAnalysis.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import cloudinary from "cloudinary";

// ✅ Configure Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 📜 Fetch all scan history for a user
export const getScanHistory = async (req, res) => {
    try {
        const { userId } = req.body;
        const scans = await DiseaseScan.find({ farmerId: userId })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: scans.length, scans });
    } catch (error) {
        console.error("Error fetching scan history:", error.message);
        res.status(500).json({ success: false, message: "Failed to fetch history" });
    }
};

// 🔍 Fetch single scan record
export const getScanById = async (req, res) => {
    try {
        const scan = await DiseaseScan.findById(req.params.id);
        if (!scan) {
            return res.status(404).json({ success: false, message: "Scan not found" });
        }
        res.status(200).json({ success: true, scan });
    } catch (error) {
        console.error("Error fetching scan:", error.message);
        res.status(500).json({ success: false, message: "Failed to fetch scan" });
    }
};

// ❌ Delete a scan
export const deleteScan = async (req, res) => {
    try {
        const scan = await DiseaseScan.findByIdAndDelete(req.params.id);
        if (!scan) {
            return res.status(404).json({ success: false, message: "Scan not found" });
        }
        res.status(200).json({ success: true, message: "Scan deleted successfully" });
    } catch (error) {
        console.error("Error deleting scan:", error.message);
        res.status(500).json({ success: false, message: "Failed to delete scan" });
    }
};

// 🧾 Generate PDF report of all scans for a farmer
export const generateReport = async (req, res) => {
    try {
        const { userId } = req.body;
        const scans = await DiseaseScan.find({ farmerId: userId }).sort({ createdAt: -1 });

        if (!scans.length) {
            return res.status(404).json({ success: false, message: "No scans found to report" });
        }

        // Create a reports folder if not existing
        const reportDir = path.join(process.cwd(), "reports");
        if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir);

        const reportFile = path.join(reportDir, `farmer_${userId}_report.pdf`);
        const doc = new PDFDocument();

        const stream = fs.createWriteStream(reportFile);
        doc.pipe(stream);

        // Header
        doc.fontSize(20).text("Poultry Disease Analysis Report", { align: "center" });
        doc.moveDown(1);

        scans.forEach((scan) => {
            doc.fontSize(12).text(`📅 Date: ${scan.createdAt.toLocaleString()}`);
            doc.text(`🐔 Disease: ${scan.diseaseName}`);
            doc.text(`🔢 Confidence: ${(scan.confidenceScore * 100).toFixed(2)}%`);
            doc.text(`💡 Recommendations: ${scan.recommendations || "N/A"}`);
            doc.moveDown(0.5);
            doc.text("-----------------------------------------------------");
            doc.moveDown(0.5);
        });

        doc.end();

        // Wait for file write, then upload to Cloudinary
        stream.on("finish", async () => {
            const cloudResult = await cloudinary.v2.uploader.upload(reportFile, {
                folder: "reports",
                resource_type: "raw",
            });

            // Delete local file after upload
            fs.unlinkSync(reportFile);

            res.status(200).json({
                success: true,
                message: "Report generated successfully",
                reportUrl: cloudResult.secure_url,
            });
        });
    } catch (error) {
        console.error("Error generating report:", error.message);
        res.status(500).json({ success: false, message: "Failed to generate report" });
    }
};
