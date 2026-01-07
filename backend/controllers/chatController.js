const Chat = require("../models/Chat");

exports.accessChat = async (req, res) => {
  const { userId } = req.body;
  const myId = req.user.id;

  let chat = await Chat.findOne({
    users: { $all: [myId, userId] }
  }).populate("users", "name email");

  if (!chat) {
    chat = await Chat.create({ users: [myId, userId] });
  }

  res.json(chat);
};

exports.getMyChats = async (req, res) => {
  const chats = await Chat.find({
    users: req.user.id
  }).populate("users", "name email");

  res.json(chats);
};
