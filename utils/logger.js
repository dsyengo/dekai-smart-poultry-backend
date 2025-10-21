import winston from "winston";
import path from "path";
import fs from "fs";

// Ensure logs directory exists
const logDir = path.resolve("/logs");
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
        ({ timestamp, level, message, stack }) =>
            `${timestamp} [${level.toUpperCase()}]: ${stack || message}`
    )
);

// Create Winston logger instance
const logger = winston.createLogger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format: logFormat,
    transports: [
        // Write all logs with level `error` and below to error.log
        new winston.transports.File({
            filename: path.join(logDir, "error.log"),
            level: "error",
        }),
        // Write all logs to combined.log
        new winston.transports.File({
            filename: path.join(logDir, "combined.log"),
        }),
    ],
});

// Add console logging in non-production environments
if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        })
    );
}

export default logger;
