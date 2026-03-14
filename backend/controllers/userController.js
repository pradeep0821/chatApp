const User = require("../models/User");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images allowed"), false);
  }
});

exports.searchUsers = async (req, res) => {
  const keyword = req.query.q;

  const users = await User.find({
    name: { $regex: keyword, $options: "i" }
  }).select("-password");
  res.json(users);
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT middleware
    const { name, email, password } = req.body;
    const profilePic = req.file ? req.file.filename : null;

    const updates = { name, email };
    if (password) {
      const bcrypt = require("bcryptjs");
      updates.password = await bcrypt.hash(password, 10);
    }

    // Store full URL so the frontend doesn't have to guess
    if (profilePic) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      updates.profilePic = `${baseUrl}/uploads/${profilePic}`;
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true })
      .select("-password");

    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Export upload middleware for route
exports.uploadProfilePic = upload.single("profilePic");

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: "User not found" });
  }
};

exports.updateTheme = async (req, res) => {
  try {
    const userId = req.user.id;
    const { theme } = req.body;
    const user = await User.findByIdAndUpdate(userId, { theme }, { new: true }).select("-password");
    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
