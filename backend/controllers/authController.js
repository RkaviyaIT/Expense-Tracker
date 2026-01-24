const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Helper function to generate a JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });
};

// @desc Register a new user
exports.registerUser = async (req, res) => {
    const { fullName, email, password, profileImageUrl } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists." });
        }

        const newUser = await User.create({
            fullName,
            email,
            password,
            profileImageUrl,
        });

        res.status(201).json({
            id: newUser._id,
            newUser,
            token: generateToken(newUser._id),
        });
    } catch (err) {
        console.error("Error in registerUser:", err);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
};

// @desc Authenticate user & get token
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        res.status(200).json({
            id: user._id,
            user,
            token: generateToken(user._id),
        });
    } catch (err) {
        console.error("Error in loginUser:", err);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
};

// @desc Get current user profile
exports.getUserInfo = async (req, res) => {
    try {
        // req.user is populated by the protect middleware
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (err) {
        console.error("Error in getUserInfo:", err);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
};