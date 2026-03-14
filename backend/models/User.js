const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true },
    email:      { type: String, required: true, unique: true },
    password:   { type: String, required: true },
    profilePic: { type: String, default: null },   // stored as /uploads/filename.jpg
    isOnline:   { type: Boolean, default: false },
    lastLogin:  { type: Date, default: null },
    theme:      { 
      type: String, 
      default: "dark",
      enum: ["dark", "light", "green", "lightBlue", "gray"]
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);