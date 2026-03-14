const express = require("express");
const cors    = require("cors");
const dotenv  = require("dotenv");
const http    = require("http");
const path    = require("path");
const fs      = require("fs");
const { Server } = require("socket.io");

const connectDB     = require("./config/db");
const socketHandler = require("./socket/socket");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth",     require("./routes/authRoutes"));
app.use("/api/users",    require("./routes/userRoutes"));
app.use("/api/chats",    require("./routes/chatRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

// ─── Static uploads ───────────────────────────────────────────────────────────
// Project root: CHATTING_APP/
//   backend/server.js  → __dirname = .../backend
//   uploads/           → one level up from backend/
const uploadsPath = path.resolve(__dirname, "../uploads");
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });
app.use("/uploads", express.static(uploadsPath));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
socketHandler(io);

server.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
});