import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, IconButton, Grid, CardActionArea, useTheme } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import NatureIcon from '@mui/icons-material/Nature';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useThemeContext } from '../../context/ThemeContext';

const G = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Cormorant+Garamond:ital,wght@1,600;1,700&display=swap');
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
  @keyframes cardIn { from{opacity:0;transform:scale(0.94) translateY(10px)} to{opacity:1;transform:none} }
`;

const THEMES = [
  { id:'dark',      name:'Dark Space', desc:'Deep & focused',  icon:<DarkModeIcon sx={{fontSize:"1.3rem"}}/>,  bg:'#0d1117', accent:'#10b981', text:'#e6edf3', sub:'#7d8590',  preview:['#10b981','#0891b2','#1a2233'] },
  { id:'light',     name:'Light Day',  desc:'Clean & airy',    icon:<LightModeIcon sx={{fontSize:"1.3rem"}}/>, bg:'#f8fafc', accent:'#6366f1', text:'#0f172a', sub:'#64748b',  preview:['#6366f1','#a78bfa','#e2e8f0'] },
  { id:'green',     name:'Forest',     desc:'Calm & natural',  icon:<NatureIcon sx={{fontSize:"1.3rem"}}/>,    bg:'#052e16', accent:'#34d399', text:'#ecfdf5', sub:'#6ee7b7',  preview:['#34d399','#059669','#064e3b'] },
  { id:'lightBlue', name:'Ocean',      desc:'Crisp & open',    icon:<WaterDropIcon sx={{fontSize:"1.3rem"}}/>, bg:'#0c1a2e', accent:'#38bdf8', text:'#e0f2fe', sub:'#7dd3fc',  preview:['#38bdf8','#0284c7','#0c2a4a'] },
  { id:'gray',      name:'Graphite',   desc:'Neutral & sharp', icon:<CloudQueueIcon sx={{fontSize:"1.3rem"}}/>,bg:'#1e293b', accent:'#94a3b8', text:'#f8fafc', sub:'#cbd5e1',  preview:['#94a3b8','#475569','#334155'] },
];

const getBackendOrigin = () => {
  const raw = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '');
  return raw.endsWith('/api') ? raw.slice(0, -4) : raw;
};
const getApiBase = () => `${getBackendOrigin()}/api`;

const SettingsPage = () => {
  const navigate = useNavigate();
  // useThemeContext provides { theme, setTheme }
  // theme = the active theme id for THIS user (should be initialised from localStorage/user.theme on login)
  const { theme, setTheme } = useThemeContext();
  const muiTheme = useTheme();
  const isDark = muiTheme.palette.mode === 'dark';

  const handleThemeChange = async (newTheme) => {
    // 1. Update UI immediately
    setTheme(newTheme);

    // 2. Persist to DB for THIS user only
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await axios.put(
        `${getApiBase()}/users/theme`,
        { theme: newTheme },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        // Update cached user so next login loads the right theme
        const cached = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...cached, theme: newTheme }));
      }
    } catch (err) {
      console.error("Theme update failed:", err);
      // Optionally revert setTheme(previousTheme) here
    }
  };

  return (
    <>
      <style>{G}</style>
      <Box sx={{ minHeight:"100vh", display:"flex", flexDirection:"column", background: muiTheme.palette.background.default, fontFamily:"'DM Sans', sans-serif", position:"relative", overflow:"hidden" }}>

        <Box sx={{ position:"absolute", top:"-15%", right:"0%", width:"45%", height:"55%", borderRadius:"50%", background:"radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 65%)", filter:"blur(90px)", pointerEvents:"none" }} />
        <Box sx={{ position:"absolute", bottom:"-15%", left:"-5%", width:"45%", height:"55%", borderRadius:"50%", background:"radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 65%)", filter:"blur(90px)", pointerEvents:"none" }} />

        {/* Header */}
        <Box sx={{ px:{ xs:3, sm:5 }, py:2.5, display:"flex", alignItems:"center", borderBottom:`1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`, backdropFilter:"blur(12px)", position:"sticky", top:0, zIndex:10, background: isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.7)" }}>
          <IconButton onClick={() => navigate(-1)} sx={{ color: muiTheme.palette.text.secondary, background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", borderRadius:"10px", width:38, height:38, mr:2, "&:hover":{ background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)", color:"#10b981" } }}>
            <ArrowBackIcon sx={{ fontSize:"1.1rem" }} />
          </IconButton>
          <Typography sx={{ fontFamily:"'Cormorant Garamond', serif", fontStyle:"italic", fontWeight:700, fontSize:"1.6rem", color: muiTheme.palette.text.primary }}>
            Settings
          </Typography>
        </Box>

        {/* Main */}
        <Box sx={{ flex:1, p:{ xs:3, sm:5 }, animation:"fadeUp 0.5s ease forwards" }}>
          <Box sx={{ maxWidth:820, mx:"auto" }}>

            <Box sx={{ mb:4 }}>
              <Typography sx={{ fontFamily:"'DM Sans', sans-serif", fontWeight:700, fontSize:"1.05rem", color: muiTheme.palette.text.primary, mb:0.5 }}>
                Appearance
              </Typography>
              <Typography sx={{ fontFamily:"'DM Sans', sans-serif", fontSize:"0.875rem", color: muiTheme.palette.text.secondary }}>
                Choose your personal theme. This is saved to your account.
              </Typography>
            </Box>

            <Grid container spacing={2.5}>
              {THEMES.map((t, idx) => {
                const isSelected = theme === t.id;
                return (
                  <Grid item xs={12} sm={6} md={4} key={t.id}>
                    <CardActionArea onClick={() => handleThemeChange(t.id)} sx={{ borderRadius:"18px", overflow:"hidden", transition:"all 0.25s cubic-bezier(0.34,1.56,0.64,1)", animation:`cardIn 0.4s ${idx * 0.07}s ease both`, "&:hover":{ transform:"translateY(-5px) scale(1.01)" } }}>
                      <Box sx={{
                        p:3, background:t.bg,
                        border: isSelected ? `2px solid ${t.accent}` : `2px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
                        borderRadius:"18px", position:"relative",
                        boxShadow: isSelected ? `0 8px 30px ${t.accent}30` : isDark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.06)"
                      }}>

                        {isSelected && (
                          <Box sx={{ position:"absolute", top:10, right:10, width:24, height:24, borderRadius:"50%", background:t.accent, display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <CheckCircleIcon sx={{ color:"#fff", fontSize:"1rem" }} />
                          </Box>
                        )}

                        {/* Icon + name */}
                        <Box sx={{ display:"flex", alignItems:"center", gap:1.5, mb:2.5 }}>
                          <Box sx={{ width:38, height:38, borderRadius:"10px", background:`${t.accent}1a`, color:t.accent, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            {t.icon}
                          </Box>
                          <Box>
                            <Typography sx={{ color:t.text, fontFamily:"'DM Sans', sans-serif", fontWeight:600, fontSize:"0.95rem", lineHeight:1.2 }}>{t.name}</Typography>
                            <Typography sx={{ color:t.sub, fontFamily:"'DM Sans', sans-serif", fontSize:"0.72rem" }}>{t.desc}</Typography>
                          </Box>
                        </Box>

                        {/* Swatches */}
                        <Box sx={{ display:"flex", gap:1, mb:2 }}>
                          {t.preview.map((c, i) => (
                            <Box key={i} sx={{ flex: i===0 ? 2 : 1, height:5, borderRadius:4, background:c, opacity: isSelected ? 1 : 0.65 }} />
                          ))}
                        </Box>

                        {/* Mock chat */}
                        <Box sx={{ display:"flex", flexDirection:"column", gap:1 }}>
                          <Box sx={{ display:"flex", justifyContent:"flex-end" }}>
                            <Box sx={{ px:1.5, py:0.6, borderRadius:"10px 10px 2px 10px", background:t.accent, maxWidth:"70%" }}>
                              <Typography sx={{ color:"#fff", fontSize:"0.58rem", fontFamily:"'DM Sans', sans-serif" }}>Hey, how are you? 👋</Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display:"flex", justifyContent:"flex-start" }}>
                            <Box sx={{ px:1.5, py:0.6, borderRadius:"10px 10px 10px 2px", background:`${t.text}18`, maxWidth:"65%" }}>
                              <Typography sx={{ color:t.text, fontSize:"0.58rem", fontFamily:"'DM Sans', sans-serif", opacity:0.85 }}>Doing great, thanks!</Typography>
                            </Box>
                          </Box>
                        </Box>

                      </Box>
                    </CardActionArea>
                  </Grid>
                );
              })}
            </Grid>

          </Box>
        </Box>
      </Box>
    </>
  );
};

export default SettingsPage;