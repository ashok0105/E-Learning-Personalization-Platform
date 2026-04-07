const User = require("../models/User");
const bcrypt = require("bcryptjs");

// GET /api/user/profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ message: "Error fetching profile" });
    }
};

// PUT /api/user/profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const update = {};

        if (name) update.name = name;
        if (email) update.email = email;
        if (password) {
            update.password = await bcrypt.hash(password, 10);
        }

        const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select("-password");
        res.json({ message: "Profile updated", user });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: "Error updating profile" });
    }
};
