const Chat = require("../models/Chat");

const USER_FIELDS = "name email profilePic isOnline lastLogin";

exports.accessChat = async (req, res) => {
  try {
    const { userId } = req.body;
    const myId = req.user.id;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    let chat = await Chat.findOne({
      users: { $all: [myId, userId] }
    }).populate("users", USER_FIELDS);

    if (!chat) {
      const created = await Chat.create({ users: [myId, userId] });
      chat = await Chat.findById(created._id).populate("users", USER_FIELDS);
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({ users: req.user.id })
      .populate("users", USER_FIELDS)
      .sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};