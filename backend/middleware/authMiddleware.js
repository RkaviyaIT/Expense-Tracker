const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user by id and exclude the password from the returned object
        req.user = await User.findById(decoded.id).select('-password');
        
        next();
    } catch (err) {
        console.error("Auth Middleware Error:", err);
        res.status(401).json({ message: "Not authorized, token failed" });
    }
};