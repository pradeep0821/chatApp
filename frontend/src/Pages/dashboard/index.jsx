import { useEffect, useState } from "react";
import {
    Box, TextField, Typography, List, ListItem, ListItemButton,
    ListItemAvatar, ListItemText, InputAdornment, Avatar, Badge,
    IconButton, Fab, useMediaQuery, useTheme, Chip
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import MessageIcon from "@mui/icons-material/Message";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import DrawerAppBar from "../../components/appbar";
import ChatArea from "../../components/ChatBox";

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@1,700&display=swap');
  @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes slideIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:none} }
  .chat-list-item { animation: slideIn 0.3s ease forwards; }
  .hide-scrollbar::-webkit-scrollbar { width:4px; }
  .hide-scrollbar::-webkit-scrollbar-track { background:transparent; }
  .hide-scrollbar::-webkit-scrollbar-thumb { background:rgba(52,211,153,0.2); border-radius:4px; }
  .hide-scrollbar::-webkit-scrollbar-thumb:hover { background:rgba(52,211,153,0.4); }
`;

const COLORS = ["#10b981","#0891b2","#6366f1","#f59e0b","#ec4899","#8b5cf6"];
const getColor = (name) => COLORS[(name?.charCodeAt(0)||0) % COLORS.length];

const TimeStamp = ({ ts }) => {
    if (!ts) return null;
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString()===now.toDateString()) return d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
    return d.toLocaleDateString([],{month:"short",day:"numeric"});
};

const DashboardPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const navigate = useNavigate();
    const [selectedChat, setSelectedChat] = useState(null);
    const BASE_URL = process.env.REACT_APP_API_URL;
    const [text, setText] = useState("");
    const [searchName, setSearchName] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [myChats, setMyChats] = useState([]);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const token = localStorage.getItem("token");

    useEffect(() => {
        try {
            const u = JSON.parse(localStorage.getItem("user") || "{}");
            if (u) setCurrentUser({ ...u, _id: u._id || u.id });
        } catch {}
    }, []);

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!token || !user) { navigate("/login", { replace:true }); return; }
        try { setName(JSON.parse(user).name); }
        catch { localStorage.clear(); navigate("/login", { replace:true }); }
    }, [navigate, token]);

    useEffect(() => {
        if (!token) return;
        fetch(`${BASE_URL}/api/chats`, { headers:{ Authorization:`Bearer ${token}` } })
            .then(r=>r.json()).then(d=>setMyChats(d||[])).catch(()=>{});
    }, [token, BASE_URL]);

    useEffect(() => {
        const t = setTimeout(() => setSearchName(text.trim()), 600);
        return () => clearTimeout(t);
    }, [text]);

    useEffect(() => {
        if (!searchName) { setSearchResults([]); return; }
        setLoading(true);
        fetch(`${BASE_URL}/api/users/search?q=${searchName}`, { headers:{ Authorization:`Bearer ${token}` } })
            .then(r=>r.json()).then(d=>setSearchResults(d||[])).catch(()=>setSearchResults([]))
            .finally(()=>setLoading(false));
    }, [searchName, token, BASE_URL]);

    const openChat = async (userId) => {
        try {
            const r = await fetch(`${BASE_URL}/api/chats`, {
                method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
                body: JSON.stringify({ userId }),
            });
            const chat = await r.json();
            setSelectedChat(chat);
            if (!myChats.find(c=>c._id===chat._id)) setMyChats(prev=>[chat,...prev]);
            if (isMobile) setShowChat(true);
            setText("");
        } catch {}
    };

    const handleChatSelect = (chat) => {
        setSelectedChat(chat);
        if (isMobile) setShowChat(true);
    };

    const getOtherUser = (chat) => chat?.users?.find(u=>u._id!==currentUser?._id) || {};
    const showChatArea = selectedChat && (isMobile ? showChat : true);
    const showSidebar = !isMobile || !showChat;

    return (
        <>
            <style>{G}</style>
            <DrawerAppBar />
            <Box sx={{ display:"flex", height:"calc(100vh - 64px)", mt:"64px", background:"#080c14", fontFamily:"'Outfit', sans-serif" }}>

                {/* SIDEBAR */}
                {showSidebar && (
                    <Box sx={{
                        width:{ xs:"100%", md:360 },
                        borderRight:"1px solid rgba(255,255,255,0.06)",
                        display:"flex", flexDirection:"column",
                        background:"#0d111a",
                        position:"relative",
                    }}>
                        {/* Header */}
                        <Box sx={{ p:3, borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                            <Box sx={{ display:"flex", alignItems:"center", justifyContent:"space-between", mb:2.5 }}>
                                <Typography sx={{ fontFamily:"'Playfair Display', serif", fontWeight:700, color:"#fff", fontSize:"1.4rem", fontStyle:"italic" }}>
                                    Messages
                                </Typography>
                                <Chip
                                    size="small"
                                    label={`${myChats.length} chats`}
                                    sx={{ background:"rgba(52,211,153,0.1)", color:"#34d399", fontFamily:"'Outfit', sans-serif", fontSize:"0.72rem", border:"1px solid rgba(52,211,153,0.2)", height:24 }}
                                />
                            </Box>

                            <TextField
                                fullWidth
                                placeholder="Search people or chats..."
                                value={text}
                                onChange={e=>setText(e.target.value)}
                                InputProps={{
                                    startAdornment:(
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color:"rgba(255,255,255,0.25)", fontSize:"1.1rem" }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root":{
                                        borderRadius:"14px",
                                        background:"rgba(255,255,255,0.04)",
                                        fontFamily:"'Outfit', sans-serif",
                                        fontSize:"0.875rem",
                                        "& fieldset":{ borderColor:"rgba(255,255,255,0.08)" },
                                        "&:hover fieldset":{ borderColor:"rgba(52,211,153,0.3)" },
                                        "&.Mui-focused fieldset":{ borderColor:"#10b981", borderWidth:1.5 },
                                    },
                                    "& .MuiInputBase-input":{ color:"rgba(255,255,255,0.8)", "&::placeholder":{ color:"rgba(255,255,255,0.25)", opacity:1 } },
                                }}
                            />
                        </Box>

                        {/* List */}
                        <Box sx={{ flex:1, overflowY:"auto" }} className="hide-scrollbar">
                            {searchName ? (
                                <Box sx={{ p:2 }}>
                                    <Typography sx={{ px:1, pb:1.5, color:"rgba(255,255,255,0.3)", fontSize:"0.72rem", letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'Outfit', sans-serif" }}>
                                        {loading ? "Searching..." : `Results for "${searchName}"`}
                                    </Typography>
                                    {searchResults.length > 0 ? (
                                        <List disablePadding>
                                            {searchResults.map((user, i) => (
                                                <ListItem key={user._id} disablePadding sx={{ mb:0.75, animation:"slideIn 0.25s ease forwards", animationDelay:`${i*0.05}s` }}>
                                                    <ListItemButton onClick={()=>openChat(user._id)} sx={{
                                                        borderRadius:"14px", py:1.5, px:2,
                                                        "&:hover":{ background:"rgba(52,211,153,0.06)", border:"1px solid rgba(52,211,153,0.12)" },
                                                        border:"1px solid transparent", transition:"all 0.2s ease",
                                                    }}>
                                                        <ListItemAvatar sx={{ minWidth:48 }}>
                                                            <Avatar sx={{ width:38, height:38, background:`linear-gradient(135deg, ${getColor(user.name)}, ${getColor(user.name)}88)`, fontFamily:"'Outfit', sans-serif", fontWeight:700, fontSize:"0.875rem" }}>
                                                                {user.name?.[0]?.toUpperCase()}
                                                            </Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={user.name}
                                                            secondary="Tap to start chatting"
                                                            primaryTypographyProps={{ sx:{ color:"rgba(255,255,255,0.85)", fontWeight:600, fontFamily:"'Outfit', sans-serif", fontSize:"0.875rem" } }}
                                                            secondaryTypographyProps={{ sx:{ color:"rgba(255,255,255,0.3)", fontFamily:"'Outfit', sans-serif", fontSize:"0.78rem" } }}
                                                        />
                                                        <AddIcon sx={{ color:"rgba(52,211,153,0.5)", fontSize:"1.1rem" }} />
                                                    </ListItemButton>
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : !loading && (
                                        <Box sx={{ textAlign:"center", py:5 }}>
                                            <Typography sx={{ color:"rgba(255,255,255,0.25)", fontFamily:"'Outfit', sans-serif", fontSize:"0.875rem" }}>No users found</Typography>
                                        </Box>
                                    )}
                                </Box>
                            ) : (
                                <Box sx={{ p:2 }}>
                                    {myChats.length > 0 ? (
                                        <>
                                            <Typography sx={{ px:1, pb:1.5, color:"rgba(255,255,255,0.25)", fontSize:"0.68rem", letterSpacing:"0.12em", textTransform:"uppercase", fontFamily:"'Outfit', sans-serif" }}>
                                                Recent
                                            </Typography>
                                            <List disablePadding>
                                                {myChats.map((chat, i) => {
                                                    const other = getOtherUser(chat);
                                                    const isActive = selectedChat?._id === chat._id;
                                                    return (
                                                        <ListItem key={chat._id} disablePadding sx={{ mb:0.5, animation:"slideIn 0.25s ease forwards", animationDelay:`${i*0.04}s` }}>
                                                            <ListItemButton onClick={()=>handleChatSelect(chat)} sx={{
                                                                borderRadius:"14px", py:1.5, px:2,
                                                                background: isActive ? "rgba(52,211,153,0.08)" : "transparent",
                                                                border: isActive ? "1px solid rgba(52,211,153,0.18)" : "1px solid transparent",
                                                                "&:hover":{ background: isActive ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.04)" },
                                                                transition:"all 0.2s ease",
                                                            }}>
                                                                <ListItemAvatar sx={{ minWidth:50 }}>
                                                                    <Badge overlap="circular" variant="dot" sx={{ "& .MuiBadge-badge":{ background:"#34d399", boxShadow:"0 0 0 2px #0d111a", width:10, height:10, borderRadius:"50%" } }}>
                                                                        <Avatar sx={{ width:40, height:40, background:`linear-gradient(135deg, ${getColor(other.name)}, ${getColor(other.name)}88)`, fontFamily:"'Outfit', sans-serif", fontWeight:700, fontSize:"0.9rem" }}>
                                                                            {other?.name?.[0]?.toUpperCase() || "?"}
                                                                        </Avatar>
                                                                    </Badge>
                                                                </ListItemAvatar>
                                                                <ListItemText
                                                                    primary={other?.name || "Chat"}
                                                                    secondary="Tap to continue"
                                                                    primaryTypographyProps={{ sx:{ color: isActive ? "#34d399" : "rgba(255,255,255,0.85)", fontWeight: isActive ? 600 : 500, fontFamily:"'Outfit', sans-serif", fontSize:"0.875rem" } }}
                                                                    secondaryTypographyProps={{ sx:{ color:"rgba(255,255,255,0.25)", fontFamily:"'Outfit', sans-serif", fontSize:"0.78rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" } }}
                                                                />
                                                                {isActive && <Box sx={{ width:6, height:6, borderRadius:"50%", background:"#34d399", flexShrink:0 }} />}
                                                            </ListItemButton>
                                                        </ListItem>
                                                    );
                                                })}
                                            </List>
                                        </>
                                    ) : (
                                        <Box sx={{ textAlign:"center", py:8, px:3 }}>
                                            <Box sx={{ width:64, height:64, borderRadius:"20px", background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.15)", display:"flex", alignItems:"center", justifyContent:"center", mx:"auto", mb:2.5 }}>
                                                <MessageIcon sx={{ fontSize:28, color:"rgba(52,211,153,0.5)" }} />
                                            </Box>
                                            <Typography sx={{ color:"rgba(255,255,255,0.6)", fontFamily:"'Outfit', sans-serif", fontWeight:600, mb:0.75 }}>No conversations yet</Typography>
                                            <Typography sx={{ color:"rgba(255,255,255,0.25)", fontSize:"0.82rem", fontFamily:"'Outfit', sans-serif" }}>Search for people to start chatting</Typography>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </Box>
                    </Box>
                )}

                {/* CHAT AREA */}
                {showChatArea ? (
                    <Box sx={{ flex:1, display:"flex", flexDirection:"column", height:"100%" }}>
                        <ChatArea chat={selectedChat} onBack={()=>{ setShowChat(false); setSelectedChat(null); }} currentUser={currentUser} />
                    </Box>
                ) : (
                    <Box sx={{ flex:1, display:{ xs:"none", md:"flex" }, flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#080c14", position:"relative", overflow:"hidden" }}>
                        {/* Background blobs */}
                        <Box sx={{ position:"absolute", top:"20%", left:"20%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)", filter:"blur(40px)" }} />
                        <Box sx={{ position:"absolute", bottom:"20%", right:"20%", width:250, height:250, borderRadius:"50%", background:"radial-gradient(circle, rgba(8,145,178,0.06) 0%, transparent 70%)", filter:"blur(40px)" }} />

                        <Box sx={{ textAlign:"center", animation:"fadeIn 0.6s ease forwards", position:"relative", zIndex:1 }}>
                            <Box sx={{ width:80, height:80, borderRadius:"24px", background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.15)", display:"flex", alignItems:"center", justifyContent:"center", mx:"auto", mb:3 }}>
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                                    <path d="M4 8h16M4 12h10M4 16h13" stroke="rgba(52,211,153,0.7)" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            </Box>
                            <Typography sx={{ fontFamily:"'Playfair Display', serif", fontSize:"1.8rem", fontWeight:700, color:"rgba(255,255,255,0.85)", fontStyle:"italic", mb:1 }}>
                                Welcome back, {name.split(" ")[0]} 👋
                            </Typography>
                            <Typography sx={{ color:"rgba(255,255,255,0.3)", fontSize:"0.9rem", fontFamily:"'Outfit', sans-serif", mb:3.5 }}>
                                Select a conversation or search for someone new
                            </Typography>
                            <Box sx={{ display:"inline-flex", alignItems:"center", gap:1, background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.15)", borderRadius:"12px", px:2.5, py:1.2, cursor:"pointer",
                                "&:hover":{ background:"rgba(52,211,153,0.12)" }, transition:"all 0.2s ease" }}
                                onClick={()=>{}}>
                                <EditIcon sx={{ fontSize:"0.95rem", color:"#34d399" }} />
                                <Typography sx={{ color:"#34d399", fontSize:"0.875rem", fontWeight:600, fontFamily:"'Outfit', sans-serif" }}>New Message</Typography>
                            </Box>
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Mobile FAB */}
            {isMobile && !showChat && (
                <Fab onClick={()=>setText("")} sx={{
                    position:"fixed", bottom:24, right:24,
                    background:"linear-gradient(135deg, #10b981, #0891b2)",
                    boxShadow:"0 4px 20px rgba(16,185,129,0.4)",
                    "&:hover":{ background:"linear-gradient(135deg, #059669, #0891b2)", transform:"scale(1.05)" },
                    transition:"all 0.2s ease",
                }}>
                    <AddIcon sx={{ color:"#fff" }} />
                </Fab>
            )}
        </>
    );
};

export default DashboardPage;