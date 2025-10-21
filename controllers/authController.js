import {
    createUser,
    getUserByEmail,
    getUsers,
    deleteUserById,
    getUserById,
} from "../models/user.js";
import {
    genSalt,
    hashPassword,
    validatePassword,
} from "../utils/helpers.js";
import jwt from 'jsonwebtoken'

const SECRET = process.env.POULTRY_SECRET;

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
    const {
        fullname,
        email,
        phone_number,
        consent_to_terms_data_use,
        password
    } = req.body;

    try {
        //validate the inputs
        if (
            !fullname &&
            !email &&
            !phone_number &&
            !password
        ) {
            return res.status(400).json({ msg: "Input the all required details" });
        }
        // Check if user already exists
        const userExists = await getUserByEmail(email);
        if (userExists) {
            return res
                .status(400)
                .json({ msg: "User already exists proceed to login" });
        }

        // Hash password
        const salt = await genSalt();

        const hashedPassword = await hashPassword(password, salt);

        // Create new user
        const newUser = await createUser({
            fullname,
            email,
            phone_number,
            consent_to_terms_data_use,
            password,
            authentication: {
                salt,
                password: hashedPassword,
            },
        });
        console.log("Account created succesfully");
        res.status(200).json({ success: true, message: "Account Created Succesfully, Please Proceed to Login" }).end();
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};


// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await getUserByEmail(email).select(
            "+authentication.salt +authentication.password +authentication.sessionToken"
        );
        if (!user) {
            return res.status(400).json({ msg: "Invalid Credentials" });
        }

        // Validate password
        const isMatch = await validatePassword(
            password,
            user.authentication.password
        );
        if (!isMatch) {
            return res.status(403).json({ msg: "Invalid Credentials" });
        }

        // Generate session token
        const sessionToken = jwt.sign({ id: user._id }, SECRET, { expiresIn: '48h' })
        user.authentication.sessionToken = sessionToken;
        await user.save();

        // Set session token in cookie
        res.cookie('token', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 2 * 24 * 60 * 60 * 1000,
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none',
        });

        // Return token in response
        return res.status(200).json({
            message: "Logged In Successfully",
            token: sessionToken,
            user: {
                id: user._id,
                email: user.email,
                fullname: user.fullname,
                phone_number: user.phone_number,
                consent_to_terms_data_use: user.consent_to_terms_data_use
            },
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};


// @desc    Authenticate user & get token
// @route   POST /api/users/logout
// @access  Public

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none',
        })

        return res.json({ success: true, message: "Logged out Succesfully" })
    } catch (error) {
        return res.json({ success: false, message: `Error occured ${error.message}` })
    }
}
