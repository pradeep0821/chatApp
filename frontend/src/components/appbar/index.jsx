import { useState } from "react";
import {
    AppBar, Toolbar, Typography, Box, Avatar, IconButton,
    Menu, MenuItem, Divider, ListItemIcon, Tooltip
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useNavigate } from "react-router-dom";

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@1,700&display=swap');
`;

const COLORS = ["#10b981","#0891b2","#6366f1","#f59e0b","#ec4899","#8b5cf6"];
const getColor = (name) => {
    try { return COLORS[(name?.charCodeAt(0) || 0) % COLORS.length]; }
    catch { return COLORS[0]; }
};

const DrawerAppBar = () => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const user = (() => {
        try {
            const raw = localStorage.getItem("user");
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    })();

    const userName = user?.name || "User";
    const userColor = getColor(userName);

    const handleOpen = (e) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleLogout = () => {
        handleClose();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

    return (
        <>
            <style>{G}</style>
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    background: "rgba(13,17,26,0.95)",
                    backdropFilter: "blur(20px)",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: "0 1px 0 rgba(52,211,153,0.08)",
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
            >
                <Toolbar sx={{ px: { xs: 2, sm: 3 }, minHeight: "64px !important", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

                    {/* LOGO */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
                        <Box sx={{
                            width: 34, height: 34, borderRadius: "10px",
                            background: "linear-gradient(135deg, #10b981, #0891b2)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 2px 12px rgba(16,185,129,0.3)",
                        }}>
                            <ChatBubbleOutlineIcon sx={{ fontSize: "1rem", color: "#fff" }} />
                        </Box>
                        <Typography sx={{
                            fontFamily: "'Playfair Display', serif",
                            fontStyle: "italic",
                            fontWeight: 700,
                            fontSize: "1.2rem",
                            color: "#fff",
                            letterSpacing: "-0.01em",
                            display: { xs: "none", sm: "block" },
                        }}>
                            ChatSpace
                        </Typography>
                    </Box>

                    {/* RIGHT — avatar + menu */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Typography sx={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: "0.85rem",
                            color: "rgba(255,255,255,0.45)",
                            display: { xs: "none", sm: "block" },
                        }}>
                            {userName}
                        </Typography>

                        <Tooltip title="Account" arrow>
                            <IconButton onClick={handleOpen} sx={{ p: 0.5 }}>
                                <Avatar sx={{
                                    width: 36, height: 36,
                                    background: `linear-gradient(135deg, ${userColor}, ${userColor}88)`,
                                    fontFamily: "'Outfit', sans-serif",
                                    fontWeight: 700,
                                    fontSize: "0.9rem",
                                    cursor: "pointer",
                                    border: open ? "2px solid #34d399" : "2px solid transparent",
                                    transition: "border-color 0.2s ease",
                                }}>
                                    {userName[0]?.toUpperCase() || "U"}
                                </Avatar>
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* DROPDOWN MENU */}
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                PaperProps={{
                    sx: {
                        mt: 1,
                        minWidth: 200,
                        background: "#0d111a",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "14px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                        overflow: "visible",
                        "& .MuiMenuItem-root": {
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: "0.875rem",
                            color: "rgba(255,255,255,0.7)",
                            borderRadius: "8px",
                            mx: 0.75,
                            px: 1.5,
                            py: 1,
                            "&:hover": {
                                background: "rgba(52,211,153,0.08)",
                                color: "#fff",
                            },
                        },
                    },
                }}
            >
                {/* User info header */}
                <Box sx={{ px: 2.5, py: 1.5, mb: 0.5 }}>
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: "#fff", fontSize: "0.9rem" }}>
                        {userName}
                    </Typography>
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", color: "rgba(255,255,255,0.3)", fontSize: "0.75rem", mt: 0.2 }}>
                        {user?.email || "Signed in"}
                    </Typography>
                </Box>

                <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mx: 1.5, mb: 0.5 }} />

                <MenuItem onClick={handleClose}>
                    <ListItemIcon><PersonOutlineIcon sx={{ fontSize: "1rem", color: "rgba(255,255,255,0.4)" }} /></ListItemIcon>
                    Profile
                </MenuItem>

                <MenuItem onClick={handleClose}>
                    <ListItemIcon><SettingsOutlinedIcon sx={{ fontSize: "1rem", color: "rgba(255,255,255,0.4)" }} /></ListItemIcon>
                    Settings
                </MenuItem>

                <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mx: 1.5, my: 0.5 }} />

                <MenuItem onClick={handleLogout} sx={{ color: "#f87171 !important", "&:hover": { background: "rgba(248,113,113,0.08) !important" } }}>
                    <ListItemIcon><LogoutIcon sx={{ fontSize: "1rem", color: "#f87171" }} /></ListItemIcon>
                    Sign out
                </MenuItem>
            </Menu>
        </>
    );
};

export default DrawerAppBar;