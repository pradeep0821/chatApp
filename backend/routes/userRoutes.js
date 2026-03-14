const express = require("express");
const { searchUsers, getMe, updateProfile, uploadProfilePic, updateTheme } = require("../controllers/userController");
const protect = require("../config/jwtMiddleware");

const router = express.Router();
router.get("/search", protect, searchUsers);
router.get("/me", protect, getMe);
router.put("/profile", protect, uploadProfilePic, updateProfile);
router.put("/theme", protect, updateTheme);

module.exports = router;
