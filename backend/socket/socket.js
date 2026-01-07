module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected");

    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
    });

    socket.on("send_message", (message) => {
      socket.to(message.chatId).emit("receive_message", message);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  });
};
