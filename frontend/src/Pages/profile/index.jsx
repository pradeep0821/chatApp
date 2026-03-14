import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box, Typography, TextField, Button, Avatar,
  CircularProgress, Alert, IconButton, useTheme
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@1,700&display=swap');
  @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
`;

const COLORS = ["#10b981","#0891b2","#6366f1","#f59e0b","#ec4899","#8b5cf6"];
const getColor = (name) => {
    try { return COLORS[(name?.charCodeAt(0) || 0) % COLORS.length]; }
    catch { return COLORS[0]; }
};

const ProfilePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', image: null });
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const token = localStorage.getItem('token');
  const RAW_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const BASE_URL = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL}/api`;

  const fetchUser = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/users/me`, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setFormData({ name: res.data.name, email: res.data.email, password: '' });
    } catch (err) {
      console.error(err);
      setError('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  }, [BASE_URL, token]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchUser();
  }, [token, navigate, fetchUser]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
      setFormData({ ...formData, image: file });
      setSuccess(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess(false);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      if (formData.password) data.append('password', formData.password);
      if (formData.image) data.append('profilePic', formData.image);

      const res = await axios.put(`${BASE_URL}/users/profile`, data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      setImagePreview(res.data.user.profilePic);
      setSuccess(true);
      setFormData({ ...formData, password: '' }); // clear password field
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const inputSx = (fieldName) => ({
    "& .MuiOutlinedInput-root": {
        borderRadius: "14px", 
        background: theme.palette.mode === 'dark' ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", 
        fontFamily: "'Outfit', sans-serif", 
        fontSize: "0.95rem",
        color: theme.palette.text.primary,
        transition: "all 0.2s ease",
        "& fieldset": { borderColor: theme.palette.mode === 'dark' ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" },
        "&:hover fieldset": { borderColor: "rgba(52,211,153,0.3)" },
        "&.Mui-focused fieldset": { borderColor: "#10b981", borderWidth: 1.5 },
        "&.Mui-focused": { background: "rgba(16,185,129,0.04)" }
    },
    "& .MuiInputLabel-root": {
        fontFamily: "'Outfit', sans-serif",
        color: theme.palette.text.secondary,
        "&.Mui-focused": { color: "#10b981" },
    },
  });

  if (loading) {
    return (
        <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: theme.palette.background.default }}>
            <CircularProgress sx={{ color: "#10b981" }} />
        </Box>
    );
  }

  const userColor = getColor(user?.name || 'User');

  return (
    <>
      <style>{G}</style>
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: theme.palette.background.default, fontFamily: "'Outfit', sans-serif", position: "relative", overflow: "hidden" }}>
        
        {/* Background Gradients */}
        <Box sx={{ position: "absolute", top: "-10%", left: "-10%", width: "50%", height: "50%", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", bottom: "-10%", right: "-10%", width: "50%", height: "50%", borderRadius: "50%", background: "radial-gradient(circle, rgba(8,145,178,0.05) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />

        {/* Top Header */}
        <Box sx={{ p: { xs: 2.5, sm: 4 }, display: "flex", alignItems: "center", borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, position: "relative", zIndex: 1 }}>
            <IconButton onClick={() => navigate('/dashboard')} sx={{ color: theme.palette.text.secondary, background: theme.palette.mode === 'dark' ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", "&:hover": { background: theme.palette.mode === 'dark' ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", color: theme.palette.text.primary }, mr: 2, width: 40, height: 40 }}>
                <ArrowBackIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
            <Typography sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontStyle: "italic", fontSize: "1.5rem", color: theme.palette.text.primary }}>
                Edit Profile
            </Typography>
        </Box>

        {/* Main Content */}
        <Box sx={{ flex: 1, p: { xs: 3, sm: 4 }, display: "flex", justifyContent: "center", animation: "fadeIn 0.6s ease forwards", position: "relative", zIndex: 1 }}>
            <Box sx={{ width: "100%", maxWidth: 500 }}>
                
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 5 }}>
                    <Box sx={{ position: "relative" }}>
                        <Avatar 
                            src={imagePreview || (user?.profilePic ? (user.profilePic.startsWith('http') ? user.profilePic : `${RAW_URL}/${user.profilePic.replace(/\\/g, '/').replace(/^\//, '')}`) : undefined)} 
                            sx={{ 
                                width: 110, height: 110, 
                                fontSize: "2.5rem", fontFamily: "'Outfit', sans-serif", fontWeight: 700,
                                background: `linear-gradient(135deg, ${userColor}, ${userColor}88)`,
                                border: `4px solid ${theme.palette.background.default}`,
                                boxShadow: theme.palette.mode === 'dark' ? "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)" : "0 8px 32px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)",
                            }}
                        >
                            {!imagePreview && !user?.profilePic && user?.name?.[0]?.toUpperCase()}
                        </Avatar>
                        
                        <input
                            accept="image/*"
                            type="file"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                            id="profile-pic"
                        />
                        <label htmlFor="profile-pic">
                            <Box 
                                component="span"
                                sx={{ 
                                    position: "absolute", bottom: 0, right: 0, 
                                    width: 36, height: 36, borderRadius: "50%", 
                                    background: "#10b981", color: "#fff",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    cursor: "pointer", border: `3px solid ${theme.palette.background.default}`,
                                    boxShadow: "0 4px 12px rgba(16,185,129,0.4)",
                                    transition: "all 0.2s ease",
                                    "&:hover": { transform: "scale(1.1)", background: "#059669" }
                                }}
                            >
                                <PhotoCameraIcon sx={{ fontSize: "1.1rem" }} />
                            </Box>
                        </label>
                    </Box>
                    <Typography sx={{ mt: 2, color: theme.palette.text.primary, fontFamily: "'Outfit', sans-serif", fontSize: "1.2rem", fontWeight: 600 }}>
                        {user?.name || "User"}
                    </Typography>
                    <Typography sx={{ color: theme.palette.text.secondary, fontFamily: "'Outfit', sans-serif", fontSize: "0.9rem" }}>
                        {user?.email}
                    </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: "12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", fontFamily: "'Outfit', sans-serif", "& .MuiAlert-icon": { color: "#f87171" } }}>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert severity="success" icon={<CheckCircleOutlineIcon fontSize="inherit" />} sx={{ mb: 3, borderRadius: "12px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#6ee7b7", fontFamily: "'Outfit', sans-serif", "& .MuiAlert-icon": { color: "#34d399" } }}>
                    Profile updated successfully!
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <TextField
                            label="Display Name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            fullWidth
                            sx={inputSx("name")}
                        />
                        <TextField
                            label="Email Address"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            fullWidth
                            sx={inputSx("email")}
                        />
                        <TextField
                            label="New Password (optional)"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            fullWidth
                            placeholder="Leave blank to keep current"
                            sx={inputSx("password")}
                        />
                        
                        <Button
                            type="submit"
                            fullWidth
                            disabled={updating}
                            sx={{
                                mt: 2, py: 1.8, borderRadius: "14px",
                                background: "linear-gradient(135deg, #10b981, #0891b2)",
                                color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: "1rem", fontWeight: 600,
                                textTransform: "none",
                                boxShadow: "0 8px 24px rgba(16,185,129,0.25)",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                    background: "linear-gradient(135deg, #059669, #0891b2)",
                                    boxShadow: "0 12px 32px rgba(16,185,129,0.35)",
                                    transform: "translateY(-2px)"
                                },
                                "&:disabled": {
                                    background: theme.palette.mode === 'dark' ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                                    color: theme.palette.mode === 'dark' ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"
                                }
                            }}
                        >
                            {updating ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : 'Save Changes'}
                        </Button>
                    </Box>
                </form>

            </Box>
        </Box>
      </Box>
    </>
  );
};

export default ProfilePage;
