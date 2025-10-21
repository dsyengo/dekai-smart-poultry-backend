import bcrypt from "bcryptjs";
import crypto from "crypto";
const SECRET = process.env.POULTRY_SECRET;


// Generate a random session token
export const random = () => crypto.randomBytes(64).toString("base64");
export const auth = (salt, id) => {
    return crypto
        .createHmac("sha256", [salt, id].join("/"))
        .update(SECRET)
        .digest("hex");
};


//password hashing
export const genSalt = () => bcrypt.genSalt(10);
export const hashPassword = async (salt, password) => {
    try {
        return bcrypt.hash(salt, password);
    } catch (error) {
        console.log(error);
    }
};

// Validate password by comparing plain password with hashed password
export const validatePassword = async (plainPassword, hashedPassword) => {
    try {
        return await bcrypt.compare(plainPassword, hashedPassword); // Compare the plain-text password with the hashed password
    } catch (error) {
        console.error("Error validating password:", error);
        throw error;
    }
};



