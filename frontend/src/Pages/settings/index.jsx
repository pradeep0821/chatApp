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
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@1,700&display=swap');
  @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
`;

const THEMES = [
  { id: 'dark', name: 'Dark Space', icon: <DarkModeIcon />, color: '#080c14', accent: '#10b981', text: '#fff' },
  { id: 'light', name: 'Light Day', icon: <LightModeIcon />, color: '#f8fafc', accent: '#6366f1', text: '#0f172a' },
  { id: 'green', name: 'Forest', icon: <NatureIcon />, color: '#064e3b', accent: '#34d399', text: '#ecfdf5' },
  { id: 'lightBlue', name: 'Ocean', icon: <WaterDropIcon />, color: '#082f49', accent: '#38bdf8', text: '#e0f2fe' },
  { id: 'gray', name: 'Graphite', icon: <CloudQueueIcon />, color: '#1e293b', accent: '#94a3b8', text: '#f8fafc' },
];

const SettingsPage = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useThemeContext();
  const muiTheme = useTheme();

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    try {
        const token = localStorage.getItem('token');
        if (token) {
            const rawUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const baseUrl = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;
            const res = await axios.put(`${baseUrl}/users/theme`, 
                { theme: newTheme },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                localStorage.setItem('user', JSON.stringify(res.data.user));
            }
        }
    } catch (err) {
        console.error("Theme update failed:", err);
    }
  };

  return (
    <>
      <style>{G}</style>
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: muiTheme.palette.background.default, fontFamily: "'Outfit', sans-serif", position: "relative", overflow: "hidden" }}>
        
        {/* Background Gradients */}
        <Box sx={{ position: "absolute", top: "-10%", left: "-10%", width: "50%", height: "50%", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", bottom: "-10%", right: "-10%", width: "50%", height: "50%", borderRadius: "50%", background: "radial-gradient(circle, rgba(8,145,178,0.05) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />

        {/* Top Header */}
        <Box sx={{ p: { xs: 2.5, sm: 4 }, display: "flex", alignItems: "center", borderBottom: `1px solid ${muiTheme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, position: "relative", zIndex: 1 }}>
            <IconButton onClick={() => navigate(-1)} sx={{ color: muiTheme.palette.text.secondary, background: muiTheme.palette.mode === 'dark' ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", "&:hover": { background: muiTheme.palette.mode === 'dark' ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", color: muiTheme.palette.text.primary }, mr: 2, width: 40, height: 40 }}>
                <ArrowBackIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
            <Typography sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontStyle: "italic", fontSize: "1.5rem", color: muiTheme.palette.text.primary }}>
                Settings
            </Typography>
        </Box>

        {/* Main Content */}
        <Box sx={{ flex: 1, p: { xs: 3, sm: 4 }, animation: "fadeIn 0.6s ease forwards", position: "relative", zIndex: 1 }}>
            <Box sx={{ maxWidth: 800, mx: "auto" }}>
                
                <Box sx={{ mb: 4 }}>
                    <Typography sx={{ color: muiTheme.palette.text.primary, fontFamily: "'Outfit', sans-serif", fontSize: "1.2rem", fontWeight: 600, mb: 1 }}>
                        Appearance
                    </Typography>
                    <Typography sx={{ color: muiTheme.palette.text.secondary, fontFamily: "'Outfit', sans-serif", fontSize: "0.9rem", mb: 3 }}>
                        Customize how ChatSpace looks on your device.
                    </Typography>

                    <Grid container spacing={2}>
                        {THEMES.map((t) => {
                            const isSelected = theme === t.id;
                            return (
                                <Grid item xs={12} sm={6} md={4} key={t.id}>
                                    <CardActionArea 
                                        onClick={() => handleThemeChange(t.id)}
                                        sx={{ 
                                            borderRadius: "16px",
                                            overflow: "hidden",
                                            transition: "all 0.2s ease",
                                            "&:hover": { transform: "translateY(-4px)" }
                                        }}
                                    >
                                        <Box sx={{ 
                                            p: 3, 
                                            background: t.color,
                                            border: isSelected ? `2px solid ${t.accent}` : "2px solid rgba(255,255,255,0.1)",
                                            borderRadius: "16px",
                                            display: "flex", flexDirection: "column", gap: 2,
                                            position: "relative"
                                        }}>
                                            {isSelected && (
                                                <CheckCircleIcon sx={{ position: "absolute", top: 12, right: 12, color: t.accent, fontSize: "1.2rem" }} />
                                            )}
                                            
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                <Box sx={{ 
                                                    width: 36, height: 36, borderRadius: "10px", 
                                                    background: `${t.accent}22`, color: t.accent,
                                                    display: "flex", alignItems: "center", justifyContent: "center"
                                                }}>
                                                    {t.icon}
                                                </Box>
                                                <Typography sx={{ color: t.text, fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: "1rem" }}>
                                                    {t.name}
                                                </Typography>
                                            </Box>
                                            
                                            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                                                <Box sx={{ flex: 1, height: 8, borderRadius: 4, background: `${t.accent}55` }} />
                                                <Box sx={{ width: 24, height: 8, borderRadius: 4, background: `${t.accent}33` }} />
                                                <Box sx={{ width: 16, height: 8, borderRadius: 4, background: `${t.accent}33` }} />
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
      </Box>
    </>
  );
};

export default SettingsPage;
