import { useEffect, useRef, useState } from "react";
import { Box, TextField, IconButton, Typography, Avatar, Badge, useTheme } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import socket from "../socket";

const G = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Cormorant+Garamond:ital,wght@1,600;1,700&display=swap');
  @keyframes msgIn   { from{opacity:0;transform:translateY(8px) scale(0.96)} to{opacity:1;transform:none} }
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.35} }
  @keyframes typing  { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
  .message-enter { animation: msgIn 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards; }
  .hide-scrollbar::-webkit-scrollbar          { width:4px; }
  .hide-scrollbar::-webkit-scrollbar-track    { background:transparent; }
  .hide-scrollbar::-webkit-scrollbar-thumb    { background:rgba(52,211,153,0.15); border-radius:4px; }
  .hide-scrollbar::-webkit-scrollbar-thumb:hover { background:rgba(52,211,153,0.35); }
`;

const COLORS = ["#10b981","#0891b2","#6366f1","#f59e0b","#ec4899","#8b5cf6"];
const getColor = (name) => {
  try { return COLORS[(name?.charCodeAt(0) || 0) % COLORS.length]; }
  catch { return COLORS[0]; }
};

// ─── Utilities ────────────────────────────────────────────────────────────────
const getId = (obj) => {
  if (!obj) return null;
  if (typeof obj === "string") return obj;
  if (typeof obj === "object") return obj._id || obj.id || obj.userId || obj.user_id || null;
  return null;
};

const getMediaBase = () => {
  const raw = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const clean = raw.replace(/\/$/, "");
  return clean.endsWith("/api") ? clean.replace(/\/api$/, "") : clean;
};

const resolveAvatar = (pic) => {
  if (!pic) return undefined;
  if (pic.startsWith("http://") || pic.startsWith("https://")) return pic;
  return `${getMediaBase()}/${pic.replace(/^\/+/, "").replace(/\\/g, "/")}`;
};

// ─── Online status helper ────────────────────────────────────────────────────
// onlineUsers can be a Set of user-id strings, or a plain object/array.
// Normalise to Set<string> once so downstream code is simple.
const toOnlineSet = (onlineUsers) => {
  if (!onlineUsers) return new Set();
  if (onlineUsers instanceof Set) return onlineUsers;
  if (Array.isArray(onlineUsers)) return new Set(onlineUsers.map(String));
  if (typeof onlineUsers === "object") return new Set(Object.keys(onlineUsers).filter(k => onlineUsers[k]).map(String));
  return new Set();
};

// ─── Component ───────────────────────────────────────────────────────────────
const ChatArea = ({ chat, onBack, currentUser, onlineUsers, lastSeenMap }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const MEDIA_BASE = getMediaBase();
  const API_BASE = MEDIA_BASE + "/api";

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const chatId = chat?._id ?? null;
  const currentUserId = getId(currentUser);

  // ── Resolve the "other" participant ─────────────────────────────────────
  const otherUser = (() => {
    try {
      if (!chat || !Array.isArray(chat.users)) return { name: "Chat" };
      for (const u of chat.users) {
        const uid = getId(u);
        if (!uid) continue;
        if (currentUserId && String(uid) === String(currentUserId)) continue;
        return typeof u === "object" ? u : { _id: uid, name: "User" };
      }
      return { name: "Chat" };
    } catch { return { name: "Chat" }; }
  })();

  const userColor   = getColor(otherUser?.name ?? "");
  const otherUserId = getId(otherUser);

  // ── Online / last-seen ───────────────────────────────────────────────────
  const onlineSet = toOnlineSet(onlineUsers);
  const isOnline  = otherUserId ? onlineSet.has(String(otherUserId)) : false;
  const lastSeen  = lastSeenMap?.[otherUserId] || otherUser?.lastLogin || null;

  // ── Auto-scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    try { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }
    catch {}
  }, [messages]);

  // ── Load messages + socket room ──────────────────────────────────────────
  useEffect(() => {
    if (!chatId || !token) return;
    setLoading(true);
    setMessages([]);
    fetch(`${API_BASE}/messages/${chatId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setMessages(Array.isArray(d) ? d : []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));

    socket.emit("join_chat", chatId);
    return () => socket.emit("leave_chat", chatId);
  }, [chatId, token, API_BASE]);

  // ── Incoming messages ────────────────────────────────────────────────────
  useEffect(() => {
    if (!chatId) return;
    const handler = (msg) => {
      try {
        if (msg?.chatId === chatId) setMessages(prev => [...prev, msg]);
      } catch {}
    };
    socket.on("receive_message", handler);
    return () => socket.off("receive_message", handler);
  }, [chatId]);

  // ── Guard ────────────────────────────────────────────────────────────────
  if (!chat || !chatId) {
    return (
      <Box sx={{ display:"flex", height:"100%", alignItems:"center", justifyContent:"center", background: theme.palette.background.default }}>
        <Typography sx={{ color: theme.palette.text.secondary, fontFamily:"'DM Sans', sans-serif" }}>
          Select a conversation to start messaging
        </Typography>
      </Box>
    );
  }

  // ── Send ─────────────────────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!text.trim() || !chatId) return;
    const msgText = text;
    setText("");
    try {
      const r = await fetch(`${API_BASE}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ chatId, text: msgText }),
      });
      const msg = await r.json();
      if (msg) {
        socket.emit("send_message", msg);
        setMessages(prev => [...prev, msg]);
      }
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  // ── Formatters ───────────────────────────────────────────────────────────
  const formatTime = (ds) => {
    try {
      if (!ds) return "";
      return new Date(ds).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
    } catch { return ""; }
  };

  const formatDate = (ds) => {
    try {
      if (!ds) return "";
      const d = new Date(ds), now = new Date();
      const yest = new Date(now); yest.setDate(yest.getDate() - 1);
      if (d.toDateString() === now.toDateString()) return "Today";
      if (d.toDateString() === yest.toDateString()) return "Yesterday";
      return d.toLocaleDateString([], { weekday:"long", month:"short", day:"numeric" });
    } catch { return ""; }
  };

  const formatLastSeen = (ds) => {
    try {
      if (!ds) return "Offline";
      const label = formatDate(ds);
      return `Last seen ${label === "Today" ? "at " + formatTime(ds) : label}`;
    } catch { return "Offline"; }
  };

  // ── Group by date ────────────────────────────────────────────────────────
  const grouped = messages.reduce((acc, m) => {
    try {
      if (!m?.createdAt) return acc;
      const k = new Date(m.createdAt).toDateString();
      if (!acc[k]) acc[k] = [];
      acc[k].push(m);
    } catch {}
    return acc;
  }, {});

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <style>{G}</style>
      <Box sx={{ display:"flex", flexDirection:"column", height:"100%", background: theme.palette.background.default, fontFamily:"'DM Sans', sans-serif" }}>

        {/* ── HEADER ── */}
        <Box sx={{
          px:3, py:2,
          display:"flex", alignItems:"center", gap:2,
          background: theme.palette.background.paper,
          borderBottom:`1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
          boxShadow:"0 1px 0 rgba(52,211,153,0.06)"
        }}>
          {onBack && (
            <IconButton onClick={onBack} sx={{
              color: theme.palette.text.secondary, display:{ xs:"flex", md:"none" },
              borderRadius:"10px",
              "&:hover":{ color:"#34d399", background:"rgba(52,211,153,0.08)" }
            }}>
              <ArrowBackIcon sx={{ fontSize:"1.1rem" }} />
            </IconButton>
          )}

          {/* ── Avatar with conditional online badge ── */}
          {isOnline ? (
            <Badge overlap="circular" variant="dot" sx={{
              "& .MuiBadge-badge": {
                background:"#34d399",
                boxShadow:`0 0 0 2px ${theme.palette.background.paper}`,
                width:11, height:11
              }
            }}>
              <Avatar
                src={resolveAvatar(otherUser?.profilePic)}
                sx={{ width:42, height:42, background:`linear-gradient(135deg, ${userColor}, ${userColor}88)`, fontWeight:700, fontSize:"0.95rem", fontFamily:"'DM Sans', sans-serif" }}
              >
                {otherUser?.name?.[0]?.toUpperCase() ?? "?"}
              </Avatar>
            </Badge>
          ) : (
            <Avatar
              src={resolveAvatar(otherUser?.profilePic)}
              sx={{ width:42, height:42, background:`linear-gradient(135deg, ${userColor}, ${userColor}88)`, fontWeight:700, fontSize:"0.95rem", fontFamily:"'DM Sans', sans-serif", filter:"grayscale(0.2)" }}
            >
              {otherUser?.name?.[0]?.toUpperCase() ?? "?"}
            </Avatar>
          )}

          <Box sx={{ flex:1, minWidth:0 }}>
            <Typography sx={{ fontFamily:"'DM Sans', sans-serif", fontWeight:600, color: theme.palette.text.primary, fontSize:"0.95rem", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {otherUser?.name ?? "Chat"}
            </Typography>
            <Box sx={{ display:"flex", alignItems:"center", gap:0.75 }}>
              {isOnline ? (
                <>
                  <Box sx={{ width:6, height:6, borderRadius:"50%", background:"#34d399", animation:"pulse 2s infinite", flexShrink:0 }} />
                  <Typography sx={{ fontSize:"0.72rem", color:"#34d399", fontFamily:"'DM Sans', sans-serif" }}>
                    Active now
                  </Typography>
                </>
              ) : (
                <Typography sx={{ fontSize:"0.72rem", color: theme.palette.text.secondary, fontFamily:"'DM Sans', sans-serif" }}>
                  {formatLastSeen(lastSeen)}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* ── MESSAGES ── */}
        <Box
          className="hide-scrollbar"
          sx={{
            flex:1, overflowY:"auto", p:{ xs:2, sm:3 },
            display:"flex", flexDirection:"column", gap:0.5,
            background: isDark
              ? `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`
              : theme.palette.background.default,
            position:"relative"
          }}
        >
          {/* subtle grid pattern */}
          <Box sx={{
            position:"absolute", inset:0, pointerEvents:"none",
            backgroundImage:"linear-gradient(rgba(52,211,153,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.018) 1px, transparent 1px)",
            backgroundSize:"40px 40px"
          }} />

          {loading ? (
            <Box sx={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Box sx={{ display:"flex", gap:0.75 }}>
                {[0, 0.2, 0.4].map((d, i) => (
                  <Box key={i} sx={{ width:8, height:8, borderRadius:"50%", background:"rgba(52,211,153,0.4)", animation:`typing 1.2s ease-in-out ${d}s infinite` }} />
                ))}
              </Box>
            </Box>
          ) : messages.length === 0 ? (
            <Box sx={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", zIndex:1 }}>
              <Box sx={{
                width:72, height:72, borderRadius:"24px",
                background:"rgba(52,211,153,0.06)",
                border:"1px solid rgba(52,211,153,0.12)",
                display:"flex", alignItems:"center", justifyContent:"center", mb:2.5
              }}>
                <Avatar
                  src={resolveAvatar(otherUser?.profilePic)}
                  sx={{ width:50, height:50, background:`linear-gradient(135deg, ${userColor}, ${userColor}88)`, fontSize:"1.2rem", fontWeight:700 }}
                >
                  {otherUser?.name?.[0]?.toUpperCase() ?? "?"}
                </Avatar>
              </Box>
              <Typography sx={{ fontFamily:"'DM Sans', sans-serif", color: theme.palette.text.primary, fontWeight:600, mb:0.5 }}>
                Start a conversation with {otherUser?.name ?? "this user"}
              </Typography>
              <Typography sx={{ color: theme.palette.text.secondary, fontSize:"0.82rem", fontFamily:"'DM Sans', sans-serif" }}>
                Messages are end-to-end encrypted 🔒
              </Typography>
            </Box>
          ) : (
            Object.entries(grouped).map(([date, msgs]) => (
              <Box key={date} sx={{ position:"relative", zIndex:1 }}>
                {/* Date pill */}
                <Box sx={{ textAlign:"center", my:2.5 }}>
                  <Box component="span" sx={{
                    background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                    borderRadius:"20px", px:2, py:0.6,
                    color: theme.palette.text.secondary,
                    fontSize:"0.72rem", fontFamily:"'DM Sans', sans-serif", letterSpacing:"0.04em"
                  }}>
                    {formatDate(msgs[0]?.createdAt ?? null)}
                  </Box>
                </Box>

                {msgs.map((msg, idx) => {
                  try {
                    if (!msg) return null;
                    const senderId = getId(msg.sender);
                    if (!senderId) return null;

                    const isMe = currentUserId ? String(senderId) === String(currentUserId) : false;
                    const prevSenderId = idx > 0 ? getId(msgs[idx - 1].sender) : null;
                    const nextSenderId = idx < msgs.length - 1 ? getId(msgs[idx + 1].sender) : null;
                    const showAvatar = !isMe && (!prevSenderId || String(prevSenderId) !== String(senderId));
                    const isLast = !nextSenderId || String(nextSenderId) !== String(senderId);

                    return (
                      <Box
                        key={msg._id ?? idx}
                        className="message-enter"
                        sx={{
                          display:"flex",
                          justifyContent: isMe ? "flex-end" : "flex-start",
                          alignItems:"flex-end",
                          gap:1,
                          mb: isLast ? 1.5 : 0.35
                        }}
                      >
                        {/* Avatar slot */}
                        {!isMe && (
                          <Box sx={{ width:30, flexShrink:0 }}>
                            {showAvatar ? (
                              <Avatar
                                src={typeof msg.sender === "object" ? resolveAvatar(msg.sender?.profilePic) : undefined}
                                sx={{ width:30, height:30, background:`linear-gradient(135deg, ${userColor}, ${userColor}88)`, fontSize:"0.7rem", fontWeight:700 }}
                              >
                                {typeof msg.sender === "object" ? msg.sender?.name?.[0]?.toUpperCase() ?? "?" : "?"}
                              </Avatar>
                            ) : (
                              <Box sx={{ width:30 }} />
                            )}
                          </Box>
                        )}

                        <Box sx={{ maxWidth:"68%", display:"flex", flexDirection:"column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                          {/* Bubble */}
                          <Box sx={{
                            px:2, py:1.25,
                            background: isMe
                              ? "linear-gradient(135deg, #059669, #0891b2)"
                              : isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
                            backdropFilter: isMe ? "none" : "blur(10px)",
                            border: isMe
                              ? "1px solid rgba(52,211,153,0.2)"
                              : isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
                            borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                            boxShadow: isMe
                              ? "0 4px 15px rgba(5,150,105,0.25)"
                              : isDark ? "0 2px 8px rgba(0,0,0,0.2)" : "0 2px 8px rgba(0,0,0,0.05)"
                          }}>
                            <Typography sx={{
                              fontFamily:"'DM Sans', sans-serif", fontSize:"0.875rem",
                              color: isMe ? "#fff" : theme.palette.text.primary,
                              lineHeight:1.55, wordBreak:"break-word"
                            }}>
                              {msg.text ?? ""}
                            </Typography>
                          </Box>

                          {/* Timestamp */}
                          {isLast && (
                            <Typography sx={{ mt:0.4, px:0.5, fontSize:"0.65rem", color: theme.palette.text.secondary, fontFamily:"'DM Sans', sans-serif" }}>
                              {formatTime(msg.createdAt)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  } catch { return null; }
                })}
              </Box>
            ))
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* ── INPUT ── */}
        <Box sx={{
          p:{ xs:2, sm:2.5 },
          background: theme.palette.background.paper,
          borderTop:`1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`
        }}>
          <Box sx={{
            display:"flex", alignItems:"flex-end", gap:1.5,
            background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
            borderRadius:"18px",
            border:`1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
            p:"8px 8px 8px 14px",
            transition:"border-color 0.2s ease",
            "&:focus-within":{ borderColor:"rgba(52,211,153,0.35)" }
          }}>
            <IconButton sx={{ color: theme.palette.text.secondary, p:0.75, "&:hover":{ color:"rgba(52,211,153,0.7)", background:"transparent" } }}>
              <EmojiEmotionsOutlinedIcon sx={{ fontSize:"1.2rem" }} />
            </IconButton>

            <TextField
              ref={inputRef}
              fullWidth
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Type a message…"
              multiline maxRows={4}
              variant="standard"
              sx={{
                "& .MuiInputBase-root":{ fontFamily:"'DM Sans', sans-serif", fontSize:"0.9rem", color: theme.palette.text.primary },
                "& .MuiInput-underline:before":{ display:"none" },
                "& .MuiInput-underline:after":{ display:"none" },
                "& textarea::placeholder":{ color: theme.palette.text.secondary, opacity:1 }
              }}
            />

            <IconButton sx={{ color: theme.palette.text.secondary, p:0.75, "&:hover":{ color:"rgba(52,211,153,0.7)", background:"transparent" } }}>
              <AttachFileIcon sx={{ fontSize:"1.1rem" }} />
            </IconButton>

            <IconButton
              onClick={sendMessage}
              disabled={!text.trim()}
              sx={{
                width:40, height:40, borderRadius:"12px", flexShrink:0,
                background: text.trim() ? "linear-gradient(135deg, #10b981, #0891b2)" : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"),
                color: text.trim() ? "#fff" : (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"),
                transition:"all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                transform: text.trim() ? "scale(1.05)" : "scale(1)",
                boxShadow: text.trim() ? "0 4px 15px rgba(16,185,129,0.35)" : "none",
                "&:hover:not(:disabled)": {
                  background:"linear-gradient(135deg, #059669, #0284c7)",
                  transform:"scale(1.1)",
                },
                "&.Mui-disabled":{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", color: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)" }
              }}
            >
              <SendIcon sx={{ fontSize:"1rem" }} />
            </IconButton>
          </Box>

          <Typography sx={{ textAlign:"center", mt:1.5, fontSize:"0.67rem", color: theme.palette.text.secondary, fontFamily:"'DM Sans', sans-serif", letterSpacing:"0.04em", opacity:0.5 }}>
            🔒 End-to-end encrypted
          </Typography>
        </Box>

      </Box>
    </>
  );
};

export default ChatArea;