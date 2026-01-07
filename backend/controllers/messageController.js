const Message = require("../models/Message");

exports.sendMessage = async (req, res) => {
  const { chatId, text } = req.body;

  let message = await Message.create({
    chatId,
    sender: req.user.id,
    text
  });

  // 🔥 VERY IMPORTANT
  message = await message.populate("sender", "name");

  res.json(message);
};


exports.getMessages = async (req, res) => {
  const messages = await Message.find({
    chatId: req.params.chatId
  }).populate("sender", "name");

  res.json(messages);
};
