import { useState } from "react";
import {
    AppBar, Toolbar, Typography, Box, Avatar, IconButton,
    Menu, MenuItem, Divider, ListItemIcon, Tooltip, useTheme
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useNavigate } from "react-router-dom";
import { useThemeContext } from "../../context/ThemeContext";

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
    const { setTheme } = useThemeContext();
    const muiTheme = useTheme();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const user = (() => {
        try {
            const raw = localStorage.getItem("user");
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    })();

    const userName = user?.name || "User";

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
                    background: muiTheme.palette.background.paper,
                    backdropFilter: "blur(20px)",
                    borderBottom: `1px solid ${muiTheme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
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
                            color: muiTheme.palette.text.primary,
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
                            color: muiTheme.palette.text.secondary,
                            display: { xs: "none", sm: "block" },
                        }}>
                            {userName}
                        </Typography>

                        <Tooltip title="Account" arrow>
                            <IconButton onClick={handleOpen} sx={{ p: 0.5 }}>
                                <Avatar 
                                    sx={{
                                      width: 36, height: 36,
                                      fontFamily: "'Outfit', sans-serif",
                                      fontWeight: 700,
                                      fontSize: "0.9rem",
                                      cursor: "pointer",
                                      background: `linear-gradient(135deg, ${getColor(userName)}, ${getColor(userName)}88)`,
                                    }}
                                    src={user?.profilePic ? (user.profilePic.startsWith('http') ? user.profilePic : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${user.profilePic.replace(/\\/g, '/')}`) : undefined}
                                  >
                                    {user?.profilePic ? null : (userName[0]?.toUpperCase() || "U")}
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
                        background: muiTheme.palette.background.paper,
                        border: `1px solid ${muiTheme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                        borderRadius: "14px",
                        boxShadow: muiTheme.palette.mode === 'dark' ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0,0,0,0.1)",
                        overflow: "visible",
                        "& .MuiMenuItem-root": {
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: "0.875rem",
                            color: muiTheme.palette.text.secondary,
                            borderRadius: "8px",
                            mx: 0.75,
                            px: 1.5,
                            py: 1,
                            "&:hover": {
                                background: muiTheme.palette.mode === 'dark' ? "rgba(52,211,153,0.08)" : "rgba(52,211,153,0.15)",
                                color: muiTheme.palette.text.primary,
                            },
                        },
                    },
                }}
            >
                {/* User info header */}
                <Box sx={{ px: 2.5, py: 1.5, mb: 0.5 }}>
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: muiTheme.palette.text.primary, fontSize: "0.9rem" }}>
                        {userName}
                    </Typography>
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", color: muiTheme.palette.text.secondary, fontSize: "0.75rem", mt: 0.2 }}>
                        {user?.email || "Signed in"}
                    </Typography>
                </Box>

                <Divider sx={{ borderColor: muiTheme.palette.mode === 'dark' ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", mx: 1.5, mb: 0.5 }} />

                <MenuItem onClick={() => {
                    handleClose();
                    navigate('/profile');
                  }}>
                    <ListItemIcon><PersonOutlineIcon sx={{ fontSize: "1rem", color: muiTheme.palette.text.secondary }} /></ListItemIcon>
                    Profile
                </MenuItem>

                <MenuItem onClick={() => {
                    handleClose();
                    navigate('/settings');
                }}>
                    <ListItemIcon><SettingsOutlinedIcon sx={{ fontSize: "1rem", color: muiTheme.palette.text.secondary }} /></ListItemIcon>
                    Settings
                </MenuItem>

                <Divider sx={{ borderColor: muiTheme.palette.mode === 'dark' ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", mx: 1.5, my: 0.5 }} />

                <MenuItem onClick={handleLogout} sx={{ color: "#f87171 !important", "&:hover": { background: "rgba(248,113,113,0.08) !important" } }}>
                    <ListItemIcon><LogoutIcon sx={{ fontSize: "1rem", color: "#f87171" }} /></ListItemIcon>
                    Sign out
                </MenuItem>
            </Menu>
        </>
    );
};

export default DrawerAppBar;