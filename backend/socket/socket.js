const User = require("../models/User");

module.exports = (io) => {
  // Track active connections: map of userId -> Set of socketIds
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // When frontend mounts and identifies the user
    socket.on("setup", async (userData) => {
      if (!userData || !userData._id) return;
      const userId = userData._id;
      
      socket.join(userId);
      socket.userId = userId;

      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
        // First connection for this user: emit globally and update DB
        io.emit("user_online", userId);
        try {
            await User.findByIdAndUpdate(userId, { isOnline: true });
        } catch (err) {
            console.error("Error setting user online:", err);
        }
      }
      onlineUsers.get(userId).add(socket.id);
      
      // Let the connecting user know who is currently online
      socket.emit("online_users", Array.from(onlineUsers.keys()));
    });

    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
    });

    socket.on("send_message", (message) => {
      socket.to(message.chatId).emit("receive_message", message);
    });

    socket.on("disconnect", async () => {
      console.log("Socket disconnected:", socket.id);
      const userId = socket.userId;
      
      if (userId && onlineUsers.has(userId)) {
        const userSockets = onlineUsers.get(userId);
        userSockets.delete(socket.id);

        if (userSockets.size === 0) {
          // Last connection closed for this user
          onlineUsers.delete(userId);
          const lastLogin = new Date();
          io.emit("user_offline", { userId, lastLogin });
          
          try {
            await User.findByIdAndUpdate(userId, { 
                isOnline: false, 
                lastLogin 
            });
          } catch (err) {
            console.error("Error setting user offline:", err);
          }
        }
      }
    });
  });
};

