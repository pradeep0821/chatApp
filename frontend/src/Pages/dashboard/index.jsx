import { useEffect, useState } from "react";
import {
  Box, TextField, Typography, List, ListItem, ListItemButton,
  ListItemAvatar, ListItemText, InputAdornment, Avatar, Badge,
  useMediaQuery, useTheme, Chip
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import MessageIcon from "@mui/icons-material/Message";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import DrawerAppBar from "../../components/appbar";
import ChatArea from "../../components/ChatBox";
import socket from "../../socket";
import { resolveAvatar, getColor } from "../../utils/avatarUtils";

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@1,700&display=swap');
  @keyframes fadeIn  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes slideIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:none} }
  .hide-scrollbar::-webkit-scrollbar          { width:4px; }
  .hide-scrollbar::-webkit-scrollbar-track    { background:transparent; }
  .hide-scrollbar::-webkit-scrollbar-thumb    { background:rgba(52,211,153,0.2); border-radius:4px; }
  .hide-scrollbar::-webkit-scrollbar-thumb:hover { background:rgba(52,211,153,0.4); }
`;

// Safe ID extractor
const getId = (obj) => {
  if (!obj) return null;
  if (typeof obj === "string") return obj;
  if (typeof obj === "object") return obj._id || obj.id || obj.userId || null;
  return null;
};

const isValidUser = (u) => {
  if (!u || typeof u !== "object") return false;
  const id = getId(u);
  return !!(id && id !== "unknown");
};

const DashboardPage = () => {
  const theme    = useTheme();
  const isDark   = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const BASE_URL = process.env.REACT_APP_API_URL || "";

  const [selectedChat, setSelectedChat]   = useState(null);
  const [text, setText]                   = useState("");
  const [searchName, setSearchName]       = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [myChats, setMyChats]             = useState([]);
  const [name, setName]                   = useState("");
  const [loading, setLoading]             = useState(false);
  const [currentUser, setCurrentUser]     = useState(null);
  const [showChat, setShowChat]           = useState(false);
  const [onlineUsers, setOnlineUsers]     = useState(new Set());
  const [lastSeenMap, setLastSeenMap]     = useState({});

  const token = (() => {
    try { return localStorage.getItem("token") || null; }
    catch { return null; }
  })();

  const currentUserId = getId(currentUser);

  // ── Load currentUser from localStorage ───────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return;
      const u = JSON.parse(raw);
      if (!u || typeof u !== "object") return;
      const id = u._id || u.id || u.userId || u.user_id || null;
      if (!id) { localStorage.removeItem("user"); return; }
      setCurrentUser({ ...u, _id: id, id });
      setName(u.name || "");
    } catch (e) {
      console.error("Failed to parse stored user:", e);
      setCurrentUser(null);
    }
  }, []);

  // ── Socket setup + online tracking ───────────────────────────────────────
  useEffect(() => {
    if (!isValidUser(currentUser)) { setSelectedChat(null); return; }

    socket.emit("setup", currentUser);

    // Full online list broadcast (on connect / reconnect)
    const handleOnlineList = (users) => {
      setOnlineUsers(new Set(Array.isArray(users) ? users.map(String) : []));
    };
    // Single user comes online
    const handleUserOnline = (userId) => {
      setOnlineUsers(prev => new Set([...prev, String(userId)]));
    };
    // Single user goes offline
    const handleUserOffline = ({ userId, lastLogin }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(String(userId));
        return next;
      });
      if (userId) setLastSeenMap(prev => ({ ...prev, [String(userId)]: lastLogin }));
    };

    socket.on("online_users",  handleOnlineList);
    socket.on("user_online",   handleUserOnline);
    socket.on("user_offline",  handleUserOffline);

    return () => {
      socket.off("online_users",  handleOnlineList);
      socket.off("user_online",   handleUserOnline);
      socket.off("user_offline",  handleUserOffline);
    };
  }, [currentUser]);

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const user = localStorage.getItem("user");
      if (!token || !user) { navigate("/login", { replace: true }); return; }
    } catch {
      localStorage.clear();
      navigate("/login", { replace: true });
    }
  }, [navigate, token]);

  // ── Fetch chats ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    fetch(`${BASE_URL}/api/chats`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setMyChats(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [token, BASE_URL]);

  // ── Search debounce ───────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setSearchName(text.trim()), 600);
    return () => clearTimeout(t);
  }, [text]);

  // ── Search users ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchName) { setSearchResults([]); return; }
    setLoading(true);
    fetch(`${BASE_URL}/api/users/search?q=${searchName}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setSearchResults(Array.isArray(d) ? d : []))
      .catch(() => setSearchResults([]))
      .finally(() => setLoading(false));
  }, [searchName, token, BASE_URL]);

  // ── Open / create chat ────────────────────────────────────────────────────
  const openChat = async (userId) => {
    if (!userId) return;
    try {
      const r = await fetch(`${BASE_URL}/api/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId }),
      });
      const chat = await r.json();
      if (!chat?._id) return;
      setSelectedChat(chat);
      setMyChats(prev => prev.find(c => c._id === chat._id) ? prev : [chat, ...prev]);
      if (isMobile) setShowChat(true);
      setText("");
    } catch {}
  };

  const handleChatSelect = (chat) => {
    if (!chat?._id) return;
    setSelectedChat(chat);
    if (isMobile) setShowChat(true);
  };

  // ── Get the other participant in a chat ───────────────────────────────────
  const getOtherUser = (chat) => {
    try {
      if (!chat || !Array.isArray(chat.users)) return { name: "Chat" };
      for (const u of chat.users) {
        const uid = getId(u);
        if (!uid) continue;
        if (currentUserId && String(uid) === String(currentUserId)) continue;
        return typeof u === "object" ? u : { name: "User" };
      }
      return { name: "Chat" };
    } catch { return { name: "Chat" }; }
  };

  const showSidebar = !isMobile || !showChat;
  const canShowChat = isValidUser(currentUser) && !!(selectedChat?._id);

  return (
    <>
      <style>{G}</style>
      <DrawerAppBar />
      <Box sx={{ display: "flex", height: "calc(100vh - 64px)", mt: "64px", background: theme.palette.background.default, fontFamily: "'Outfit', sans-serif" }}>

        {/* ── SIDEBAR ── */}
        {showSidebar && (
          <Box sx={{ width: { xs: "100%", md: 360 }, borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`, display: "flex", flexDirection: "column", background: theme.palette.background.paper }}>

            {/* Header */}
            <Box sx={{ p: 3, borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
                <Typography sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: theme.palette.text.primary, fontSize: "1.4rem", fontStyle: "italic" }}>
                  Messages
                </Typography>
                <Chip size="small" label={`${myChats.length} chats`} sx={{ background: "rgba(52,211,153,0.1)", color: "#34d399", fontFamily: "'Outfit', sans-serif", fontSize: "0.72rem", border: "1px solid rgba(52,211,153,0.2)", height: 24 }} />
              </Box>
              <TextField
                fullWidth placeholder="Search people or chats..."
                value={text} onChange={e => setText(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: "1.1rem" }} /></InputAdornment> }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px", background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", fontFamily: "'Outfit', sans-serif", fontSize: "0.875rem",
                    "& fieldset": { borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" },
                    "&:hover fieldset": { borderColor: "rgba(52,211,153,0.3)" },
                    "&.Mui-focused fieldset": { borderColor: "#10b981", borderWidth: 1.5 },
                  },
                  "& .MuiInputBase-input": { color: theme.palette.text.primary, "&::placeholder": { color: theme.palette.text.secondary, opacity: 1 } },
                }}
              />
            </Box>

            {/* List */}
            <Box sx={{ flex: 1, overflowY: "auto" }} className="hide-scrollbar">

              {/* ── Search results ── */}
              {searchName ? (
                <Box sx={{ p: 2 }}>
                  <Typography sx={{ px: 1, pb: 1.5, color: theme.palette.text.secondary, fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Outfit', sans-serif" }}>
                    {loading ? "Searching..." : `Results for "${searchName}"`}
                  </Typography>
                  {searchResults.length > 0 ? (
                    <List disablePadding>
                      {searchResults.map((u, i) => {
                        const uid       = getId(u);
                        const uColor    = getColor(u.name);
                        const uAvatar   = resolveAvatar(u.profilePic); // ← fixed
                        const isOnline  = uid ? onlineUsers.has(String(uid)) : false;
                        return (
                          <ListItem key={uid || i} disablePadding sx={{ mb: 0.75 }}>
                            <ListItemButton onClick={() => openChat(uid)} sx={{ borderRadius: "14px", py: 1.5, px: 2, "&:hover": { background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.12)" }, border: "1px solid transparent", transition: "all 0.2s ease" }}>
                              <ListItemAvatar sx={{ minWidth: 50 }}>
                                {/* Online badge on search results too */}
                                {isOnline ? (
                                  <Badge overlap="circular" variant="dot" sx={{ "& .MuiBadge-badge": { background: "#34d399", boxShadow: `0 0 0 2px ${theme.palette.background.paper}`, width: 10, height: 10 } }}>
                                    <Avatar src={uAvatar} sx={{ width: 38, height: 38, background: `linear-gradient(135deg, ${uColor}, ${uColor}88)`, fontWeight: 700, fontSize: "0.875rem" }}>
                                      {!uAvatar ? (u.name?.[0]?.toUpperCase() ?? "?") : null}
                                    </Avatar>
                                  </Badge>
                                ) : (
                                  <Avatar src={uAvatar} sx={{ width: 38, height: 38, background: `linear-gradient(135deg, ${uColor}, ${uColor}88)`, fontWeight: 700, fontSize: "0.875rem" }}>
                                    {!uAvatar ? (u.name?.[0]?.toUpperCase() ?? "?") : null}
                                  </Avatar>
                                )}
                              </ListItemAvatar>
                              <ListItemText
                                primary={u.name || "Unknown"}
                                secondary={isOnline ? "Online" : "Tap to start chatting"}
                                primaryTypographyProps={{ sx: { color: theme.palette.text.primary, fontWeight: 600, fontFamily: "'Outfit', sans-serif", fontSize: "0.875rem" } }}
                                secondaryTypographyProps={{ sx: { color: isOnline ? "#34d399" : theme.palette.text.secondary, fontFamily: "'Outfit', sans-serif", fontSize: "0.78rem" } }}
                              />
                              <AddIcon sx={{ color: "rgba(52,211,153,0.5)", fontSize: "1.1rem" }} />
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </List>
                  ) : !loading && (
                    <Box sx={{ textAlign: "center", py: 5 }}>
                      <Typography sx={{ color: theme.palette.text.secondary, fontFamily: "'Outfit', sans-serif", fontSize: "0.875rem" }}>No users found</Typography>
                    </Box>
                  )}
                </Box>

              ) : (
                /* ── Chat list ── */
                <Box sx={{ p: 2 }}>
                  {myChats.length > 0 ? (
                    <>
                      <Typography sx={{ px: 1, pb: 1.5, color: theme.palette.text.secondary, fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Outfit', sans-serif" }}>
                        Recent
                      </Typography>
                      <List disablePadding>
                        {myChats.map((chat, i) => {
                          const other    = getOtherUser(chat);
                          const otherId  = getId(other);
                          const isActive = selectedChat?._id === chat._id;
                          const isOnline = otherId ? onlineUsers.has(String(otherId)) : false;
                          const oColor   = getColor(other.name);
                          const oAvatar  = resolveAvatar(other.profilePic); // ← fixed

                          return (
                            <ListItem key={chat._id || i} disablePadding sx={{ mb: 0.5 }}>
                              <ListItemButton
                                onClick={() => handleChatSelect(chat)}
                                sx={{ borderRadius: "14px", py: 1.5, px: 2, background: isActive ? "rgba(52,211,153,0.08)" : "transparent", border: isActive ? "1px solid rgba(52,211,153,0.18)" : "1px solid transparent", "&:hover": { background: isActive ? "rgba(52,211,153,0.1)" : isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }, transition: "all 0.2s ease" }}
                              >
                                <ListItemAvatar sx={{ minWidth: 52 }}>
                                  {/* ── Online badge: only shown when actually online ── */}
                                  {isOnline ? (
                                    <Badge overlap="circular" variant="dot" sx={{ "& .MuiBadge-badge": { background: "#34d399", boxShadow: `0 0 0 2px ${theme.palette.background.paper}`, width: 10, height: 10, borderRadius: "50%" } }}>
                                      <Avatar src={oAvatar} sx={{ width: 40, height: 40, background: `linear-gradient(135deg, ${oColor}, ${oColor}88)`, fontWeight: 700, fontSize: "0.9rem" }}>
                                        {!oAvatar ? (other.name?.[0]?.toUpperCase() ?? "?") : null}
                                      </Avatar>
                                    </Badge>
                                  ) : (
                                    <Avatar src={oAvatar} sx={{ width: 40, height: 40, background: `linear-gradient(135deg, ${oColor}, ${oColor}88)`, fontWeight: 700, fontSize: "0.9rem" }}>
                                      {!oAvatar ? (other.name?.[0]?.toUpperCase() ?? "?") : null}
                                    </Avatar>
                                  )}
                                </ListItemAvatar>
                                <ListItemText
                                  primary={other?.name ?? "Chat"}
                                  secondary={isOnline ? "Online" : "Tap to continue"}
                                  primaryTypographyProps={{ sx: { color: isActive ? "#34d399" : theme.palette.text.primary, fontWeight: isActive ? 600 : 500, fontFamily: "'Outfit', sans-serif", fontSize: "0.875rem" } }}
                                  secondaryTypographyProps={{ sx: { color: isOnline ? "#34d399" : theme.palette.text.secondary, fontFamily: "'Outfit', sans-serif", fontSize: "0.78rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }}
                                />
                                {isActive && <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", flexShrink: 0 }} />}
                              </ListItemButton>
                            </ListItem>
                          );
                        })}
                      </List>
                    </>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 8, px: 3 }}>
                      <Box sx={{ width: 64, height: 64, borderRadius: "20px", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2.5 }}>
                        <MessageIcon sx={{ fontSize: 28, color: "rgba(52,211,153,0.5)" }} />
                      </Box>
                      <Typography sx={{ color: theme.palette.text.primary, fontFamily: "'Outfit', sans-serif", fontWeight: 600, mb: 0.75 }}>No conversations yet</Typography>
                      <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.82rem", fontFamily: "'Outfit', sans-serif" }}>Search for people to start chatting</Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* ── MAIN PANEL ── */}
        {(!isMobile || showChat) && (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", background: theme.palette.background.default, position: "relative", overflow: "hidden" }}>
            {canShowChat ? (
              <ChatArea
                chat={selectedChat}
                onBack={() => { setShowChat(false); setSelectedChat(null); }}
                currentUser={currentUser}
                onlineUsers={onlineUsers}
                lastSeenMap={lastSeenMap}
              />
            ) : (
              <>
                <Box sx={{ position: "absolute", top: "20%", left: "20%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
                <Box sx={{ position: "absolute", bottom: "20%", right: "20%", width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(8,145,178,0.06) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", animation: "fadeIn 0.6s ease forwards", position: "relative", zIndex: 1 }}>
                  <Box sx={{ width: 80, height: 80, borderRadius: "24px", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3 }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                      <path d="M4 8h16M4 12h10M4 16h13" stroke="rgba(52,211,153,0.7)" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </Box>
                  <Typography sx={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 700, color: theme.palette.text.primary, fontStyle: "italic", mb: 1 }}>
                    Welcome back, {name ? name.split(" ")[0] : "there"} 👋
                  </Typography>
                  <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.9rem", fontFamily: "'Outfit', sans-serif", mb: 3.5 }}>
                    Select a conversation or search for someone new
                  </Typography>
                  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)", borderRadius: "12px", px: 2.5, py: 1.2, cursor: "pointer", "&:hover": { background: "rgba(52,211,153,0.12)" }, transition: "all 0.2s ease" }}>
                    <EditIcon sx={{ fontSize: "0.95rem", color: "#34d399" }} />
                    <Typography sx={{ color: "#34d399", fontSize: "0.875rem", fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>New Message</Typography>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        )}

      </Box>
    </>
  );
};

export default DashboardPage;