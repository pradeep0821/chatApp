import { useEffect, useRef, useState } from "react";
import { Box, TextField, IconButton, Typography, Avatar, Badge } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import socket from "../socket";

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@1,700&display=swap');
  @keyframes msgIn { from{opacity:0;transform:translateY(8px) scale(0.96)} to{opacity:1;transform:none} }
  @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
  @keyframes typing { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
  .message-enter { animation: msgIn 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards; }
  .hide-scrollbar::-webkit-scrollbar { width:4px; }
  .hide-scrollbar::-webkit-scrollbar-track { background:transparent; }
  .hide-scrollbar::-webkit-scrollbar-thumb { background:rgba(52,211,153,0.15); border-radius:4px; }
  .hide-scrollbar::-webkit-scrollbar-thumb:hover { background:rgba(52,211,153,0.35); }
`;

const COLORS = ["#10b981","#0891b2","#6366f1","#f59e0b","#ec4899","#8b5cf6"];
const getColor = (name) => {
    try { return COLORS[(name?.charCodeAt(0) || 0) % COLORS.length]; }
    catch { return COLORS[0]; }
};

// Safe ID extractor — handles string IDs, populated objects, any shape
const getId = (obj) => {
    if (!obj) return null;
    if (typeof obj === "string") return obj;
    if (typeof obj === "object") return obj._id || obj.id || obj.userId || obj.user_id || null;
    return null;
};

const ChatArea = ({ chat, onBack, currentUser }) => {
    const BASE_URL = process.env.REACT_APP_API_URL || "";
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("token");
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Safely derive IDs as plain strings — never access .x on potentially null/undefined
    const chatId = chat?._id ?? null;
    const currentUserId = getId(currentUser);

    // Safe otherUser resolution — handles both populated objects and bare string IDs
    const otherUser = (() => {
        try {
            if (!chat || !Array.isArray(chat.users)) return { name: "Chat" };
            for (let i = 0; i < chat.users.length; i++) {
                const u = chat.users[i];
                const uid = getId(u); // works whether u is a string or object
                if (!uid) continue;
                if (!currentUserId) return typeof u === "object" ? u : { _id: uid, name: uid };
                if (String(uid) !== String(currentUserId)) {
                    return typeof u === "object" ? u : { _id: uid, name: "User" };
                }
            }
            return { name: "Chat" };
        } catch { return { name: "Chat" }; }
    })();

    const userColor = getColor(otherUser?.name ?? "");

    useEffect(() => {
        try { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }
        catch {}
    }, [messages]);

    useEffect(() => {
        if (!chatId || !token) return;
        setLoading(true);
        setMessages([]);
        fetch(`${BASE_URL}/api/messages/${chatId}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(d => setMessages(Array.isArray(d) ? d : []))
            .catch(() => setMessages([]))
            .finally(() => setLoading(false));

        socket.emit("join_chat", chatId);
        return () => socket.emit("leave_chat", chatId);
    }, [chatId, token, BASE_URL]);

    useEffect(() => {
        if (!chatId) return;
        const handler = (msg) => {
            try {
                if (msg && msg.chatId === chatId) setMessages(prev => [...prev, msg]);
            } catch {}
        };
        socket.on("receive_message", handler);
        return () => socket.off("receive_message", handler);
    }, [chatId]);

    // Guard: don't render UI if essential data is missing
    if (!chat || !chatId) {
        return (
            <Box sx={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", background: "#080c14" }}>
                <Typography sx={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Outfit', sans-serif" }}>
                    Select a chat to start messaging
                </Typography>
            </Box>
        );
    }

    const sendMessage = async () => {
        if (!text.trim() || !chatId) return;
        const msgText = text;
        setText("");
        try {
            const r = await fetch(`${BASE_URL}/api/messages`, {
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

    const formatTime = (ds) => {
        try {
            if (!ds) return "";
            return new Date(ds).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } catch { return ""; }
    };

    const formatDate = (ds) => {
        try {
            if (!ds) return "";
            const d = new Date(ds), now = new Date();
            const yest = new Date(now); yest.setDate(yest.getDate() - 1);
            if (d.toDateString() === now.toDateString()) return "Today";
            if (d.toDateString() === yest.toDateString()) return "Yesterday";
            return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
        } catch { return ""; }
    };

    const grouped = messages.reduce((acc, m) => {
        try {
            if (!m || !m.createdAt) return acc;
            const k = new Date(m.createdAt).toDateString();
            if (!acc[k]) acc[k] = [];
            acc[k].push(m);
        } catch {}
        return acc;
    }, {});

    return (
        <>
            <style>{G}</style>
            <Box sx={{ display: "flex", flexDirection: "column", height: "100%", background: "#080c14", fontFamily: "'Outfit', sans-serif" }}>

                {/* HEADER */}
                <Box sx={{
                    px: 3, py: 2,
                    display: "flex", alignItems: "center", gap: 2,
                    background: "rgba(13,17,26,0.95)",
                    backdropFilter: "blur(20px)",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: "0 1px 0 rgba(52,211,153,0.08)",
                }}>
                    {onBack && (
                        <IconButton
                            onClick={onBack}
                            sx={{
                                color: "rgba(255,255,255,0.4)",
                                display: { xs: "flex", md: "none" },
                                borderRadius: "10px",
                                "&:hover": { color: "#34d399", background: "rgba(52,211,153,0.08)" },
                            }}
                        >
                            <ArrowBackIcon sx={{ fontSize: "1.1rem" }} />
                        </IconButton>
                    )}

                    <Badge overlap="circular" variant="dot" sx={{ "& .MuiBadge-badge": { background: "#34d399", boxShadow: "0 0 0 2px #0d111a", width: 11, height: 11 } }}>
                        <Avatar sx={{ width: 42, height: 42, background: `linear-gradient(135deg, ${userColor}, ${userColor}88)`, fontWeight: 700, fontSize: "0.95rem" }}>
                            {otherUser?.name?.[0]?.toUpperCase() ?? "?"}
                        </Avatar>
                    </Badge>

                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: "rgba(255,255,255,0.9)", fontSize: "0.95rem" }}>
                            {otherUser?.name ?? "Chat"}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", animation: "pulse 2s infinite" }} />
                            <Typography sx={{ fontSize: "0.72rem", color: "#34d399", fontFamily: "'Outfit', sans-serif" }}>Active now</Typography>
                        </Box>
                    </Box>
                </Box>

                {/* MESSAGES */}
                <Box
                    sx={{
                        flex: 1, overflowY: "auto", p: 3,
                        display: "flex", flexDirection: "column", gap: 0.5,
                        background: "linear-gradient(180deg, #080c14 0%, #0a0e1a 100%)",
                        position: "relative",
                    }}
                    className="hide-scrollbar"
                >
                    <Box sx={{
                        position: "absolute", inset: 0,
                        backgroundImage: "linear-gradient(rgba(52,211,153,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.02) 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                        pointerEvents: "none",
                    }} />

                    {loading ? (
                        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Box sx={{ display: "flex", gap: 0.75 }}>
                                {[0, 0.2, 0.4].map((d, i) => (
                                    <Box key={i} sx={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(52,211,153,0.4)", animation: `typing 1.2s ease-in-out ${d}s infinite` }} />
                                ))}
                            </Box>
                        </Box>
                    ) : messages.length === 0 ? (
                        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}>
                            <Box sx={{ width: 70, height: 70, borderRadius: "22px", background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.12)", display: "flex", alignItems: "center", justifyContent: "center", mb: 2.5 }}>
                                <Avatar sx={{ width: 48, height: 48, background: `linear-gradient(135deg, ${userColor}, ${userColor}88)`, fontSize: "1.2rem", fontWeight: 700 }}>
                                    {otherUser?.name?.[0]?.toUpperCase() ?? "?"}
                                </Avatar>
                            </Box>
                            <Typography sx={{ fontFamily: "'Outfit', sans-serif", color: "rgba(255,255,255,0.6)", fontWeight: 600, mb: 0.5 }}>
                                Start a conversation with {otherUser?.name ?? "this user"}
                            </Typography>
                            <Typography sx={{ color: "rgba(255,255,255,0.25)", fontSize: "0.82rem", fontFamily: "'Outfit', sans-serif" }}>
                                Messages are end-to-end encrypted
                            </Typography>
                        </Box>
                    ) : (
                        Object.entries(grouped).map(([date, msgs]) => (
                            <Box key={date} sx={{ position: "relative", zIndex: 1 }}>
                                {/* Date pill */}
                                <Box sx={{ textAlign: "center", my: 2.5 }}>
                                    <Box component="span" sx={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", px: 2, py: 0.6, color: "rgba(255,255,255,0.35)", fontSize: "0.72rem", fontFamily: "'Outfit', sans-serif", letterSpacing: "0.04em" }}>
                                        {formatDate(msgs[0]?.createdAt ?? null)}
                                    </Box>
                                </Box>

                                {msgs.map((msg, idx) => {
                                    try {
                                        if (!msg) return null;

                                        // Safe sender ID — handles string or object sender
                                        const senderId = getId(msg.sender);
                                        if (!senderId) return null;

                                        const isMe = currentUserId
                                            ? String(senderId) === String(currentUserId)
                                            : false;

                                        const prevMsg = idx > 0 ? msgs[idx - 1] : null;
                                        const nextMsg = idx < msgs.length - 1 ? msgs[idx + 1] : null;
                                        const prevSenderId = prevMsg ? getId(prevMsg.sender) : null;
                                        const nextSenderId = nextMsg ? getId(nextMsg.sender) : null;

                                        const showAvatar = !isMe && (idx === 0 || String(prevSenderId) !== String(senderId));
                                        const isLast = idx === msgs.length - 1 || String(nextSenderId) !== String(senderId);

                                        return (
                                            <Box
                                                key={msg._id ?? idx}
                                                className="message-enter"
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: isMe ? "flex-end" : "flex-start",
                                                    alignItems: "flex-end",
                                                    gap: 1,
                                                    mb: isLast ? 1.5 : 0.35,
                                                }}
                                            >
                                                {/* Other user avatar */}
                                                {!isMe && (
                                                    <Box sx={{ width: 30, flexShrink: 0 }}>
                                                        {showAvatar ? (
                                                            <Avatar sx={{ width: 30, height: 30, background: `linear-gradient(135deg, ${userColor}, ${userColor}88)`, fontSize: "0.7rem", fontWeight: 700 }}>
                                                                {typeof msg.sender === "object"
                                                                    ? msg.sender?.name?.[0]?.toUpperCase() ?? "?"
                                                                    : "?"}
                                                            </Avatar>
                                                        ) : (
                                                            <Box sx={{ width: 30 }} />
                                                        )}
                                                    </Box>
                                                )}

                                                <Box sx={{ maxWidth: "68%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                                                    {/* Bubble */}
                                                    <Box sx={{
                                                        px: 2, py: 1.25,
                                                        background: isMe
                                                            ? "linear-gradient(135deg, #059669, #0891b2)"
                                                            : "rgba(255,255,255,0.06)",
                                                        backdropFilter: isMe ? "none" : "blur(10px)",
                                                        border: isMe
                                                            ? "1px solid rgba(52,211,153,0.2)"
                                                            : "1px solid rgba(255,255,255,0.08)",
                                                        borderRadius: isMe
                                                            ? "18px 18px 4px 18px"
                                                            : "18px 18px 18px 4px",
                                                        boxShadow: isMe
                                                            ? "0 4px 15px rgba(5,150,105,0.25)"
                                                            : "0 2px 8px rgba(0,0,0,0.2)",
                                                    }}>
                                                        <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.875rem", color: isMe ? "#fff" : "rgba(255,255,255,0.85)", lineHeight: 1.55, wordBreak: "break-word" }}>
                                                            {msg.text ?? ""}
                                                        </Typography>
                                                    </Box>

                                                    {/* Timestamp */}
                                                    {isLast && (
                                                        <Typography sx={{ mt: 0.4, px: 0.5, fontSize: "0.65rem", color: "rgba(255,255,255,0.2)", fontFamily: "'Outfit', sans-serif" }}>
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

                {/* INPUT AREA */}
                <Box sx={{
                    p: 2.5,
                    background: "rgba(13,17,26,0.95)",
                    backdropFilter: "blur(20px)",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                }}>
                    <Box sx={{
                        display: "flex", alignItems: "flex-end", gap: 1.5,
                        background: "rgba(255,255,255,0.04)",
                        borderRadius: "18px",
                        border: "1px solid rgba(255,255,255,0.08)",
                        p: "8px 8px 8px 16px",
                        transition: "border-color 0.2s ease",
                        "&:focus-within": { borderColor: "rgba(52,211,153,0.3)" },
                    }}>
                        <IconButton sx={{ color: "rgba(255,255,255,0.2)", p: 0.75, "&:hover": { color: "rgba(52,211,153,0.6)", background: "transparent" } }}>
                            <EmojiEmotionsOutlinedIcon sx={{ fontSize: "1.2rem" }} />
                        </IconButton>

                        <TextField
                            ref={inputRef}
                            fullWidth
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                            placeholder="Type a message..."
                            multiline
                            maxRows={4}
                            variant="standard"
                            sx={{
                                "& .MuiInputBase-root": { fontFamily: "'Outfit', sans-serif", fontSize: "0.9rem", color: "rgba(255,255,255,0.85)" },
                                "& .MuiInput-underline:before": { display: "none" },
                                "& .MuiInput-underline:after": { display: "none" },
                                "& textarea::placeholder": { color: "rgba(255,255,255,0.2)", opacity: 1 },
                            }}
                        />

                        <IconButton sx={{ color: "rgba(255,255,255,0.2)", p: 0.75, "&:hover": { color: "rgba(52,211,153,0.6)", background: "transparent" } }}>
                            <AttachFileIcon sx={{ fontSize: "1.1rem" }} />
                        </IconButton>

                        <IconButton
                            onClick={sendMessage}
                            disabled={!text.trim()}
                            sx={{
                                width: 40, height: 40, borderRadius: "12px", flexShrink: 0,
                                background: text.trim()
                                    ? "linear-gradient(135deg, #10b981, #0891b2)"
                                    : "rgba(255,255,255,0.06)",
                                color: text.trim() ? "#fff" : "rgba(255,255,255,0.2)",
                                transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                                transform: text.trim() ? "scale(1.05)" : "scale(1)",
                                boxShadow: text.trim() ? "0 4px 15px rgba(16,185,129,0.35)" : "none",
                                "&:hover": {
                                    background: text.trim()
                                        ? "linear-gradient(135deg, #059669, #0284c7)"
                                        : "rgba(255,255,255,0.08)",
                                    transform: text.trim() ? "scale(1.1)" : "none",
                                },
                                "&.Mui-disabled": { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.15)" },
                            }}
                        >
                            <SendIcon sx={{ fontSize: "1rem" }} />
                        </IconButton>
                    </Box>

                    <Typography sx={{ textAlign: "center", mt: 1.5, fontSize: "0.67rem", color: "rgba(255,255,255,0.12)", fontFamily: "'Outfit', sans-serif", letterSpacing: "0.04em" }}>
                        🔒 End-to-end encrypted
                    </Typography>
                </Box>
            </Box>
        </>
    );
};

export default ChatArea;