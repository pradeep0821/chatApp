import { useState, useEffect } from "react";
import {
  AppBar, Toolbar, Typography, Box, Avatar, IconButton,
  Menu, MenuItem, Divider, ListItemIcon, Tooltip, useTheme
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useNavigate } from "react-router-dom";
import { resolveAvatar, getColor } from "../../utils/avatarUtils";
import socket from "../../socket"; // ← import socket so we can disconnect on logout

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@1,700&display=swap');
`;

const readUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const DrawerAppBar = () => {
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isDark   = muiTheme.palette.mode === "dark";
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [user, setUser] = useState(readUser);

  useEffect(() => {
    const refresh = () => setUser(readUser());
    window.addEventListener("focus", refresh);
    window.addEventListener("user-updated", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("user-updated", refresh);
    };
  }, []);

  const userName  = user?.name || "User";
  const avatarSrc = resolveAvatar(user?.profilePic);
  const userColor = getColor(userName);

  const handleOpen  = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();

    // ── Disconnect socket BEFORE clearing localStorage ─────────────────────
    // This triggers the 'disconnect' event on the backend immediately,
    // which marks the user offline and broadcasts 'user_offline' to others.
    // Without this, the backend only finds out when the socket times out
    // (can take 20–60 seconds).
    try {
      socket.disconnect();
    } catch {}

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
          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
          boxShadow: "0 1px 0 rgba(52,211,153,0.08)",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 }, minHeight: "64px !important", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
            <Box sx={{ width: 34, height: 34, borderRadius: "10px", background: "linear-gradient(135deg, #10b981, #0891b2)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 12px rgba(16,185,129,0.3)" }}>
              <ChatBubbleOutlineIcon sx={{ fontSize: "1rem", color: "#fff" }} />
            </Box>
            <Typography sx={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "1.2rem", color: muiTheme.palette.text.primary, letterSpacing: "-0.01em", display: { xs: "none", sm: "block" } }}>
              ChatSpace
            </Typography>
          </Box>

          {/* Right */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.85rem", color: muiTheme.palette.text.secondary, display: { xs: "none", sm: "block" } }}>
              {userName}
            </Typography>
            <Tooltip title="Account" arrow>
              <IconButton onClick={handleOpen} sx={{ p: 0.5 }}>
                <Avatar
                  src={avatarSrc}
                  sx={{
                    width: 36, height: 36,
                    fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "0.9rem",
                    cursor: "pointer",
                    background: `linear-gradient(135deg, ${userColor}, ${userColor}88)`,
                    border: `2px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                  }}
                >
                  {!avatarSrc ? (userName[0]?.toUpperCase() || "U") : null}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: {
            mt: 1, minWidth: 220,
            background: muiTheme.palette.background.paper,
            border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
            borderRadius: "14px",
            boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0,0,0,0.1)",
            "& .MuiMenuItem-root": {
              fontFamily: "'Outfit', sans-serif", fontSize: "0.875rem",
              color: muiTheme.palette.text.secondary,
              borderRadius: "8px", mx: 0.75, px: 1.5, py: 1,
              "&:hover": {
                background: isDark ? "rgba(52,211,153,0.08)" : "rgba(52,211,153,0.15)",
                color: muiTheme.palette.text.primary,
              },
            },
          },
        }}
      >
        {/* User info header */}
        <Box sx={{ px: 2, py: 1.5, mb: 0.5, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            src={avatarSrc}
            sx={{ width: 40, height: 40, background: `linear-gradient(135deg, ${userColor}, ${userColor}88)`, fontWeight: 700, fontSize: "1rem" }}
          >
            {!avatarSrc ? (userName[0]?.toUpperCase() || "U") : null}
          </Avatar>
          <Box>
            <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: muiTheme.palette.text.primary, fontSize: "0.9rem" }}>
              {userName}
            </Typography>
            <Typography sx={{ fontFamily: "'Outfit', sans-serif", color: muiTheme.palette.text.secondary, fontSize: "0.75rem", mt: 0.2 }}>
              {user?.email || "Signed in"}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", mx: 1.5, mb: 0.5 }} />

        <MenuItem onClick={() => { handleClose(); navigate("/profile"); }}>
          <ListItemIcon><PersonOutlineIcon sx={{ fontSize: "1rem", color: muiTheme.palette.text.secondary }} /></ListItemIcon>
          Profile
        </MenuItem>

        <MenuItem onClick={() => { handleClose(); navigate("/settings"); }}>
          <ListItemIcon><SettingsOutlinedIcon sx={{ fontSize: "1rem", color: muiTheme.palette.text.secondary }} /></ListItemIcon>
          Settings
        </MenuItem>

        <Divider sx={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", mx: 1.5, my: 0.5 }} />

        <MenuItem
          onClick={handleLogout}
          sx={{ color: "#f87171 !important", "&:hover": { background: "rgba(248,113,113,0.08) !important" } }}
        >
          <ListItemIcon><LogoutIcon sx={{ fontSize: "1rem", color: "#f87171" }} /></ListItemIcon>
          Sign out
        </MenuItem>
      </Menu>
</>
  );
};

export default DrawerAppBar;