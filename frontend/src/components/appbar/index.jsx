import * as React from "react";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { useNavigate } from "react-router-dom";
import { Avatar, Badge } from "@mui/material";

const drawerWidth = 300;

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@1,700&display=swap');
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.6;transform:scale(0.9);} }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
`;

function DrawerAppBar(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleDrawerToggle = () => setMobileOpen(v => !v);
  const handleLogout = () => { localStorage.clear(); navigate("/login", { replace: true }); };

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initials = user.name?.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2) || "U";

  const drawer = (
    <Box sx={{ height:"100%", display:"flex", flexDirection:"column", background:"#0d111a", fontFamily:"'Outfit', sans-serif" }}>
      {/* Brand */}
      <Box sx={{ p:3, display:"flex", alignItems:"center", gap:2, borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <Box sx={{ width:38, height:38, borderRadius:"12px", background:"linear-gradient(135deg, #10b981, #0891b2)", display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 0 20px rgba(16,185,129,0.3)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 8h16M4 12h10M4 16h13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </Box>
        <Typography sx={{ fontFamily:"'Playfair Display', serif", fontWeight:700, color:"#fff", fontSize:"1.15rem", fontStyle:"italic" }}>
          ChatSphere
        </Typography>
      </Box>

      {/* User profile section */}
      <Box sx={{ p:2.5, mx:2, mt:2, borderRadius:"14px", background:"rgba(52,211,153,0.05)", border:"1px solid rgba(52,211,153,0.1)" }}>
        <Box sx={{ display:"flex", alignItems:"center", gap:1.5 }}>
          <Avatar sx={{ width:40, height:40, background:"linear-gradient(135deg, #10b981, #0891b2)", fontFamily:"'Outfit', sans-serif", fontWeight:700, fontSize:"0.85rem" }}>
            {initials}
          </Avatar>
          <Box>
            <Typography sx={{ color:"#fff", fontSize:"0.875rem", fontWeight:600, fontFamily:"'Outfit', sans-serif" }}>{user.name || "User"}</Typography>
            <Box sx={{ display:"flex", alignItems:"center", gap:0.5 }}>
              <Box sx={{ width:6, height:6, borderRadius:"50%", background:"#34d399", animation:"pulse 2s ease-in-out infinite" }} />
              <Typography sx={{ color:"#34d399", fontSize:"0.72rem", fontFamily:"'Outfit', sans-serif" }}>Online</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <List sx={{ flex:1, px:2, py:2 }}>
        <Typography sx={{ px:1.5, pb:1, color:"rgba(255,255,255,0.25)", fontSize:"0.68rem", letterSpacing:"0.12em", fontFamily:"'Outfit', sans-serif", textTransform:"uppercase" }}>
          Navigation
        </Typography>
        <ListItem disablePadding>
          <ListItemButton sx={{ borderRadius:"12px", py:1.4, gap:0.5,
            background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.12)",
            "&:hover":{ background:"rgba(52,211,153,0.12)" } }}>
            <ListItemIcon sx={{ minWidth:40 }}>
              <ChatBubbleOutlineIcon sx={{ color:"#34d399", fontSize:"1.1rem" }} />
            </ListItemIcon>
            <ListItemText primary="All Chats" primaryTypographyProps={{ sx:{ color:"#34d399", fontWeight:600, fontFamily:"'Outfit', sans-serif", fontSize:"0.9rem" } }} />
          </ListItemButton>
        </ListItem>
      </List>

      <Box sx={{ p:2, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ borderRadius:"12px", py:1.4,
            "&:hover":{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.15)" },
            border:"1px solid transparent", transition:"all 0.2s ease" }}>
            <ListItemIcon sx={{ minWidth:40 }}>
              <LogoutIcon sx={{ color:"#ef4444", fontSize:"1.1rem" }} />
            </ListItemIcon>
            <ListItemText primary="Sign Out" primaryTypographyProps={{ sx:{ color:"#ef4444", fontWeight:500, fontFamily:"'Outfit', sans-serif", fontSize:"0.9rem" } }} />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <>
      <style>{G}</style>
      <AppBar position="fixed" elevation={0} sx={{
        background:"rgba(8,12,20,0.85)",
        backdropFilter:"blur(20px)",
        borderBottom:"1px solid rgba(255,255,255,0.06)",
        boxShadow:"0 1px 0 rgba(52,211,153,0.1)",
      }}>
        <Toolbar sx={{ justifyContent:"space-between", px:{ xs:2, md:3 } }}>
          <Box sx={{ display:"flex", alignItems:"center", gap:1.5 }}>
            <IconButton onClick={handleDrawerToggle} sx={{ color:"rgba(255,255,255,0.5)", "&:hover":{ color:"#34d399", background:"rgba(52,211,153,0.08)" }, borderRadius:"10px" }}>
              <MenuIcon />
            </IconButton>
            <Box sx={{ display:"flex", alignItems:"center", gap:1.2 }}>
              <Box sx={{ width:32, height:32, borderRadius:"10px", background:"linear-gradient(135deg, #10b981, #0891b2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M4 8h16M4 12h10M4 16h13" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </Box>
              <Typography sx={{
                fontFamily:"'Playfair Display', serif",
                fontWeight:700,
                color:"#fff",
                fontSize:"1.1rem",
                fontStyle:"italic",
                background:"linear-gradient(90deg, #fff, #34d399, #fff)",
                backgroundSize:"200% auto",
                WebkitBackgroundClip:"text",
                WebkitTextFillColor:"transparent",
                animation:"shimmer 4s linear infinite",
              }}>
                ChatSphere
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display:"flex", alignItems:"center", gap:1.5 }}>
            <Tooltip title={user.name || "User"} arrow>
              <Box sx={{ display:"flex", alignItems:"center", gap:1, cursor:"pointer",
                background:"rgba(255,255,255,0.04)", borderRadius:"12px", px:1.5, py:0.8,
                border:"1px solid rgba(255,255,255,0.08)",
                "&:hover":{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(52,211,153,0.2)" },
                transition:"all 0.2s ease" }}>
                <Badge overlap="circular" variant="dot" sx={{ "& .MuiBadge-badge":{ background:"#34d399", boxShadow:"0 0 0 2px #080c14" } }}>
                  <Avatar sx={{ width:30, height:30, background:"linear-gradient(135deg, #10b981, #0891b2)", fontSize:"0.75rem", fontWeight:700 }}>
                    {initials}
                  </Avatar>
                </Badge>
                <Typography sx={{ color:"rgba(255,255,255,0.7)", fontSize:"0.82rem", fontWeight:500, fontFamily:"'Outfit', sans-serif", display:{ xs:"none", sm:"block" } }}>
                  {user.name?.split(" ")[0] || "User"}
                </Typography>
              </Box>
            </Tooltip>

            <Tooltip title="Sign Out" arrow>
              <IconButton onClick={handleLogout} sx={{ color:"rgba(255,255,255,0.35)", borderRadius:"10px",
                "&:hover":{ color:"#ef4444", background:"rgba(239,68,68,0.08)" }, transition:"all 0.2s ease" }}>
                <LogoutIcon sx={{ fontSize:"1.1rem" }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer container={container} variant="temporary" open={mobileOpen} onClose={handleDrawerToggle}
        ModalProps={{ keepMounted:true }}
        sx={{ display:{ xs:"block", sm:"none" }, "& .MuiDrawer-paper":{ boxSizing:"border-box", width:drawerWidth, background:"#0d111a", borderRight:"1px solid rgba(255,255,255,0.06)" } }}>
        {drawer}
      </Drawer>
      <Toolbar />
    </>
  );
}

DrawerAppBar.propTypes = { window: PropTypes.func };
export default DrawerAppBar;