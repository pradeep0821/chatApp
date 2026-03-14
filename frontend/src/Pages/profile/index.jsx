import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box, Typography, TextField, Button, Avatar,
  CircularProgress, IconButton, useTheme, Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const G = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Cormorant+Garamond:ital,wght@1,600;1,700&display=swap');
  @keyframes fadeUp    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
  @keyframes scaleIn   { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
  @keyframes ringPulse { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0.4)} 50%{box-shadow:0 0 0 12px rgba(16,185,129,0)} }
  @keyframes toastIn   { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
  @keyframes toastOut  { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(24px)} }
`;

const COLORS = ["#10b981","#0891b2","#6366f1","#f59e0b","#ec4899","#8b5cf6"];
const getColor = (name) => {
  try { return COLORS[(name?.charCodeAt(0) || 0) % COLORS.length]; }
  catch { return COLORS[0]; }
};

const getBackendOrigin = () => {
  const raw = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '');
  return raw.endsWith('/api') ? raw.slice(0, -4) : raw;
};
const getApiBase = () => `${getBackendOrigin()}/api`;

const resolveAvatar = (pic) => {
  if (!pic) return undefined;
  if (pic.startsWith('http://') || pic.startsWith('https://')) {
    try {
      const url = new URL(pic);
      if (url.pathname.startsWith('/uploads/')) return `${getBackendOrigin()}${url.pathname}`;
      return pic;
    } catch { return pic; }
  }
  return `${getBackendOrigin()}/${pic.replace(/\\/g, '/').replace(/^\/+/, '')}`;
};

// ─── Toast component ──────────────────────────────────────────────────────────
const Toast = ({ message, type, visible }) => {
  const isSuccess = type === 'success';
  return (
    <Box sx={{
      position: 'fixed', top: 24, right: 24, zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 1.5,
      px: 2.5, py: 1.5,
      background: isSuccess
        ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(8,145,178,0.15))'
        : 'rgba(239,68,68,0.12)',
      backdropFilter: 'blur(20px)',
      border: `1px solid ${isSuccess ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
      borderRadius: '14px',
      boxShadow: isSuccess
        ? '0 8px 32px rgba(16,185,129,0.2)'
        : '0 8px 32px rgba(239,68,68,0.15)',
      animation: visible ? 'toastIn 0.3s ease forwards' : 'toastOut 0.3s ease forwards',
      minWidth: 240,
    }}>
      {isSuccess
        ? <CheckCircleOutlineIcon sx={{ color: '#34d399', fontSize: '1.2rem', flexShrink: 0 }} />
        : <ErrorOutlineIcon sx={{ color: '#f87171', fontSize: '1.2rem', flexShrink: 0 }} />
      }
      <Typography sx={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '0.875rem',
        fontWeight: 500,
        color: isSuccess ? '#6ee7b7' : '#fca5a5',
      }}>
        {message}
      </Typography>
    </Box>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';

  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [updating, setUpdating]   = useState(false);
  const [formData, setFormData]   = useState({ name:'', email:'', password:'', image:null });
  const [imagePreview, setImagePreview] = useState(null);

  // Toast state
  const [toast, setToast]         = useState({ visible: false, message: '', type: 'success' });
  const [toastLeaving, setToastLeaving] = useState(false);

  const showToast = (message, type = 'success') => {
    setToastLeaving(false);
    setToast({ visible: true, message, type });
    // Start exit animation after 2.7s, remove after 3s
    setTimeout(() => setToastLeaving(true), 2700);
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  };

  const token = localStorage.getItem('token');
  const BASE_URL = getApiBase();

  const fetchUser = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setFormData({ name: res.data.name || '', email: res.data.email || '', password: '', image: null });
    } catch {
      showToast('Failed to load profile.', 'error');
    } finally {
      setLoading(false);
    }
  }, [BASE_URL, token]);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchUser();
  }, [token, navigate, fetchUser]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
    setFormData(f => ({ ...f, image: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      if (formData.password.trim()) data.append('password', formData.password);
      if (formData.image) data.append('profilePic', formData.image);

      const res = await axios.put(`${BASE_URL}/users/profile`, data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      setImagePreview(null);
      window.dispatchEvent(new Event('user-updated'));
      setFormData(f => ({ ...f, password: '', image: null }));
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Update failed. Please try again.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
      fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem",
      color: theme.palette.text.primary, transition: "all 0.25s ease",
      "& fieldset": { borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)" },
      "&:hover fieldset": { borderColor: "rgba(16,185,129,0.35)" },
      "&.Mui-focused fieldset": { borderColor: "#10b981", borderWidth: 1.5 },
      "&.Mui-focused": { background: "rgba(16,185,129,0.03)" }
    },
    "& .MuiInputLabel-root": {
      fontFamily: "'DM Sans', sans-serif", color: theme.palette.text.secondary,
      "&.Mui-focused": { color: "#10b981" }
    },
  };

  if (loading) {
    return (
      <Box sx={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background: theme.palette.background.default }}>
        <CircularProgress sx={{ color:"#10b981" }} size={36} thickness={3} />
      </Box>
    );
  }

  const userColor = getColor(user?.name || 'U');
  const avatarSrc = imagePreview ?? resolveAvatar(user?.profilePic);

  return (
    <>
      <style>{G}</style>

      {/* ── Toast ── */}
      {toast.visible && (
        <Toast message={toast.message} type={toast.type} visible={!toastLeaving} />
      )}

      <Box sx={{ minHeight:"100vh", display:"flex", flexDirection:"column", background: theme.palette.background.default, fontFamily:"'DM Sans', sans-serif", position:"relative", overflow:"hidden" }}>

        {/* Blobs */}
        <Box sx={{ position:"absolute", top:"-15%", right:"-5%", width:"40%", height:"50%", borderRadius:"50%", background:"radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)", filter:"blur(80px)", pointerEvents:"none" }} />
        <Box sx={{ position:"absolute", bottom:"-10%", left:"-5%", width:"40%", height:"50%", borderRadius:"50%", background:"radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)", filter:"blur(80px)", pointerEvents:"none" }} />

        {/* Header */}
        <Box sx={{ px:{ xs:3, sm:5 }, py:2.5, display:"flex", alignItems:"center", borderBottom:`1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`, backdropFilter:"blur(12px)", position:"sticky", top:0, zIndex:10, background: isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.7)" }}>
          <IconButton onClick={() => navigate(-1)} sx={{ color: theme.palette.text.secondary, borderRadius:"10px", width:38, height:38, mr:2, background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", "&:hover":{ background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)", color:"#10b981" } }}>
            <ArrowBackIcon sx={{ fontSize:"1.1rem" }} />
          </IconButton>
          <Typography sx={{ fontFamily:"'Cormorant Garamond', serif", fontStyle:"italic", fontWeight:700, fontSize:"1.6rem", color: theme.palette.text.primary }}>
            Edit Profile
          </Typography>
        </Box>

        {/* Content */}
        <Box sx={{ flex:1, p:{ xs:3, sm:5 }, display:"flex", justifyContent:"center", animation:"fadeUp 0.5s ease forwards" }}>
          <Box sx={{ width:"100%", maxWidth:480 }}>

            {/* Avatar */}
            <Box sx={{ display:"flex", flexDirection:"column", alignItems:"center", mb:5, animation:"scaleIn 0.5s 0.1s ease both" }}>
              <Box sx={{ position:"relative", mb:2 }}>
                <Box sx={{ p:"4px", borderRadius:"50%", background:`linear-gradient(135deg, ${userColor}, ${userColor}55)`, animation:"ringPulse 3s infinite" }}>
                  <Avatar
                    src={avatarSrc}
                    sx={{ width:108, height:108, fontSize:"2.4rem", fontWeight:700, fontFamily:"'DM Sans', sans-serif", background:`linear-gradient(135deg, ${userColor}cc, ${userColor}66)`, border:`3px solid ${theme.palette.background.default}` }}
                  >
                    {!avatarSrc ? (user?.name?.[0]?.toUpperCase() ?? 'U') : null}
                  </Avatar>
                </Box>
                <input accept="image/*" type="file" onChange={handleImageChange} style={{ display:'none' }} id="profile-pic" />
                <label htmlFor="profile-pic">
                  <Box component="span" sx={{ position:"absolute", bottom:2, right:2, width:34, height:34, borderRadius:"50%", background:"#10b981", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", border:`3px solid ${theme.palette.background.default}`, boxShadow:"0 4px 14px rgba(16,185,129,0.45)", transition:"all 0.2s ease", "&:hover":{ transform:"scale(1.12)", background:"#059669" } }}>
                    <PhotoCameraIcon sx={{ fontSize:"1rem" }} />
                  </Box>
                </label>
              </Box>

              <Typography sx={{ fontFamily:"'DM Sans', sans-serif", fontSize:"1.25rem", fontWeight:700, color: theme.palette.text.primary, mb:0.25 }}>
                {user?.name || "User"}
              </Typography>
              <Typography sx={{ fontFamily:"'DM Sans', sans-serif", fontSize:"0.85rem", color: theme.palette.text.secondary }}>
                {user?.email}
              </Typography>

              {imagePreview && (
                <Box sx={{ mt:1.5, px:2, py:0.6, borderRadius:"20px", background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)" }}>
                  <Typography sx={{ fontSize:"0.75rem", color:"#10b981", fontFamily:"'DM Sans', sans-serif", fontWeight:500 }}>
                    New photo selected — save to apply
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Form */}
            <Box sx={{ background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)", border:`1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, borderRadius:"20px", p:{ xs:3, sm:4 } }}>
              <Typography sx={{ fontFamily:"'DM Sans', sans-serif", fontWeight:600, fontSize:"0.78rem", letterSpacing:"0.08em", textTransform:"uppercase", color: theme.palette.text.secondary, mb:3 }}>
                Account Details
              </Typography>
              <form onSubmit={handleSubmit}>
                <Box sx={{ display:"flex", flexDirection:"column", gap:2.5 }}>
                  <TextField label="Display Name" value={formData.name} onChange={e => setFormData(f=>({...f,name:e.target.value}))} fullWidth sx={fieldSx}
                    InputProps={{ startAdornment: <PersonOutlineIcon sx={{ mr:1, fontSize:"1.1rem", color: theme.palette.text.secondary }} /> }} />
                  <TextField label="Email Address" type="email" value={formData.email} onChange={e => setFormData(f=>({...f,email:e.target.value}))} fullWidth sx={fieldSx}
                    InputProps={{ startAdornment: <EmailOutlinedIcon sx={{ mr:1, fontSize:"1.1rem", color: theme.palette.text.secondary }} /> }} />
                  <Divider sx={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }} />
                  <TextField label="New Password (optional)" type="password" value={formData.password} onChange={e => setFormData(f=>({...f,password:e.target.value}))} fullWidth placeholder="Leave blank to keep current" sx={fieldSx}
                    InputProps={{ startAdornment: <LockOutlinedIcon sx={{ mr:1, fontSize:"1.1rem", color: theme.palette.text.secondary }} /> }} />

                  <Button type="submit" fullWidth disabled={updating} sx={{
                    mt:1, py:1.7, borderRadius:"12px",
                    background: updating ? undefined : "linear-gradient(135deg, #10b981 0%, #0891b2 100%)",
                    color:"#fff", fontFamily:"'DM Sans', sans-serif", fontSize:"0.95rem", fontWeight:600,
                    textTransform:"none", letterSpacing:"0.02em",
                    boxShadow: updating ? "none" : "0 8px 24px rgba(16,185,129,0.28)",
                    transition:"all 0.25s ease",
                    "&:hover:not(:disabled)":{ background:"linear-gradient(135deg, #059669 0%, #0284c7 100%)", boxShadow:"0 12px 32px rgba(16,185,129,0.4)", transform:"translateY(-2px)" },
                    "&:disabled":{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }
                  }}>
                    {updating
                      ? <Box sx={{ display:"flex", alignItems:"center", gap:1 }}><CircularProgress size={18} sx={{ color:"inherit" }} /><span>Saving…</span></Box>
                      : 'Save Changes'}
                  </Button>
                </Box>
              </form>
            </Box>

          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ProfilePage;