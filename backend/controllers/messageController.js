const Message = require("../models/Message");

// Fields needed from the sender:
// - name        → display name in chat bubbles
// - profilePic  → avatar next to messages
const SENDER_FIELDS = "name profilePic";

exports.sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;
    if (!chatId || !text?.trim()) {
      return res.status(400).json({ error: "chatId and text are required" });
    }

    let message = await Message.create({
      chatId,
      sender: req.user.id,
      text,
    });

    // Populate sender so the frontend gets name + profilePic immediately
    // without needing a separate fetch
    message = await message.populate("sender", SENDER_FIELDS);

    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      chatId: req.params.chatId,
    }).populate("sender", SENDER_FIELDS); // ← was "name" only, missing profilePic

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};