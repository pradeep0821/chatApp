
const express = require("express");
const { accessChat, getMyChats } = require("../controllers/chatController");
const protect = require("../config/jwtMiddleware");

const router = express.Router();

router.post("/", protect, accessChat);
router.get("/", protect, getMyChats);

module.exports = router;
