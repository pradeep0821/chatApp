const User = require("../models/User");

exports.searchUsers = async (req, res) => {
  const keyword = req.query.q;

  const users = await User.find({
    name: { $regex: keyword, $options: "i" }
  }).select("-password");
  res.json(users);
};
