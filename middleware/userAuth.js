import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const userAuth = async (req, res, next) => {
    try {
        let token;

        // Check for token in cookies
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        // If not in cookies, check Authorization header
        else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        // If token not found
        if (!token) {
            return res.status(401).json({ success: false, message: "Not Authorised, Please login" });
        }

        // Verify token
        const decodeToken = jwt.verify(token, process.env.POULTRY_SECRET);

        // ✅ Ensure req.body always exists before assigning
        if (!req.body) req.body = {};

        // ✅ Attach userId from token payload
        req.body.userId = decodeToken.id;

        console.log(`User id: ${req.body.userId}`)

        next();
    } catch (error) {
        console.error("Error in userAuth middleware: ", error.message);
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};
