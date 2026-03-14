const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: null },
    isOnline: { type: Boolean, default: false },
    lastLogin: { type: Date, default: null },
    theme: { type: String, default: "dark" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
