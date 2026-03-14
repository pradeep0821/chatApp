const User   = require("../models/User");
const multer = require("multer");
const path   = require("path");
const fs     = require("fs");
const bcrypt = require("bcryptjs");

// ─── Multer storage ───────────────────────────────────────────────────────────
// Structure:
//   CHATTING_APP/
//     backend/
//       controllers/
//         userController.js   ← __dirname is here
//     uploads/                ← two levels up from controllers/

const uploadsPath = path.resolve(__dirname, "../../uploads");

// Ensure folder exists at startup
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

console.log("💾 Multer saving uploads to:", uploadsPath);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images allowed"), false);
  },
});

exports.uploadProfilePic = upload.single("profilePic");

// ─── Search users ─────────────────────────────────────────────────────────────
exports.searchUsers = async (req, res) => {
  try {
    const keyword = req.query.q || "";
    const users = await User.find({
      name: { $regex: keyword, $options: "i" },
      _id:  { $ne: req.user.id },
    }).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Get current user ─────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Update profile ───────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const updates = {};

    if (name)  updates.name  = name;
    if (email) updates.email = email;
    if (password && password.trim()) {
      updates.password = await bcrypt.hash(password, 10);
    }

    if (req.file) {
      // Store as relative path — frontend prepends REACT_APP_API_URL at render time
      updates.profilePic = `/uploads/${req.file.filename}`;
      console.log("✅ Profile pic saved:", path.join(uploadsPath, req.file.filename));
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true })
      .select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ─── Update theme ─────────────────────────────────────────────────────────────
exports.updateTheme = async (req, res) => {
  try {
    const { theme } = req.body;
    const valid = ["dark", "light", "green", "lightBlue", "gray"];
    if (!valid.includes(theme)) {
      return res.status(400).json({ error: "Invalid theme" });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { theme },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};