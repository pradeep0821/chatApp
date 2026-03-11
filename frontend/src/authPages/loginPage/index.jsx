import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Alert,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import EmailIcon from "@mui/icons-material/Email";
import GoogleIcon from "@mui/icons-material/Google";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const ACCENT = "#6366f1";
const ACCENT2 = "#0ea5e9";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-32px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(32px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes floatBubble {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-12px); }
  }
`;

const ChatBubble = ({ text, align = "left", delay = 0, color = "rgba(255,255,255,0.08)" }) => (
  <Box sx={{
    display: "flex",
    justifyContent: align === "right" ? "flex-end" : "flex-start",
    animation: `floatBubble 4s ease-in-out ${delay}s infinite`,
  }}>
    <Box sx={{
      background: color,
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: align === "right" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
      px: 2,
      py: 1,
      maxWidth: "75%",
    }}>
      <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", fontFamily: "'Sora', sans-serif" }}>{text}</Typography>
    </Box>
  </Box>
);

const LoginPage = () => {
  const BASE_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message || "Login failed");
        return;
      }
      localStorage.setItem("token", result.token);
      const decoded = jwtDecode(result.token);
      localStorage.setItem("user", JSON.stringify({ id: decoded.id, name: decoded.name }));
      navigate("/dashboard");
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputSx = (fieldName) => ({
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      fontFamily: "'Sora', sans-serif",
      fontSize: "0.9rem",
      background: focused === fieldName ? "rgba(99,102,241,0.04)" : "#fafafa",
      transition: "all 0.2s ease",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: focused === fieldName ? ACCENT : "#e2e8f0",
        borderWidth: focused === fieldName ? 2 : 1,
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#94a3b8",
      },
    },
    "& .MuiInputLabel-root": {
      fontFamily: "'Sora', sans-serif",
      fontSize: "0.875rem",
      color: "#94a3b8",
      "&.Mui-focused": { color: ACCENT },
    },
  });

  return (
    <>
      <style>{globalStyles}</style>
      <Box sx={{ minHeight: "100vh", display: "flex", fontFamily: "'Sora', sans-serif", background: "#f8fafc" }}>

        {/* RIGHT form panel first on mobile, visually left on desktop */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 3, sm: 6 },
            position: "relative",
            background: "#f8fafc",
            order: { xs: 1, md: 0 },
          }}
        >
          <Box sx={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 20%, rgba(99,102,241,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(14,165,233,0.05) 0%, transparent 50%)", pointerEvents: "none" }} />

          <Box sx={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1, animation: "slideInLeft 0.7s ease forwards" }}>
            {/* Mobile logo */}
            <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1.5, mb: 5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: "10px", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Box component="span" sx={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>C</Box>
              </Box>
              <Typography sx={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: "1rem", color: "#0f172a" }}>ChatSpace</Typography>
            </Box>

            <Box sx={{ mb: 5 }}>
              <Typography sx={{ fontFamily: "'DM Serif Display', serif", fontSize: "2rem", color: "#0f172a", lineHeight: 1.2, mb: 1 }}>
                Welcome back
              </Typography>
              <Typography sx={{ color: "#94a3b8", fontSize: "0.9rem", fontFamily: "'Sora', sans-serif" }}>
                Don't have an account?{" "}
                <Link to="/signup" style={{ color: ACCENT, textDecoration: "none", fontWeight: 600 }}>Create one →</Link>
              </Typography>
            </Box>

            <Button
              variant="outlined"
              fullWidth
              startIcon={<GoogleIcon sx={{ fontSize: "1.1rem !important" }} />}
              sx={{
                borderRadius: "12px",
                py: 1.4,
                fontFamily: "'Sora', sans-serif",
                fontWeight: 500,
                fontSize: "0.875rem",
                borderColor: "#e2e8f0",
                color: "#334155",
                background: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                mb: 3,
                "&:hover": { borderColor: "#cbd5e1", background: "#f8fafc", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
              }}
            >
              Continue with Google
            </Button>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Box sx={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
              <Typography sx={{ color: "#cbd5e1", fontSize: "0.75rem", fontFamily: "'Sora', sans-serif", whiteSpace: "nowrap" }}>or with email</Typography>
              <Box sx={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: "12px", background: "#fff1f2", border: "1px solid #fecdd3", color: "#be123c", fontFamily: "'Sora', sans-serif", fontSize: "0.875rem", "& .MuiAlert-icon": { color: "#be123c" } }}>
                {error}
              </Alert>
            )}

            <Stack spacing={2.5}>
              <TextField
                label="Email Address"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused("")}
                fullWidth
                placeholder="you@example.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ fontSize: "1.1rem", opacity: 0.4, color: "#334155" }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputSx("email")}
              />

              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused("")}
                fullWidth
                placeholder="••••••••"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ fontSize: "1.1rem", opacity: 0.4, color: "#334155" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: "#94a3b8", mr: -0.5 }}>
                        {showPassword ? <VisibilityOffIcon sx={{ fontSize: "1.1rem" }} /> : <VisibilityIcon sx={{ fontSize: "1.1rem" }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={inputSx("password")}
              />

              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      sx={{ color: "#cbd5e1", "&.Mui-checked": { color: ACCENT }, p: 0.5 }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: "0.825rem", color: "#64748b", fontFamily: "'Sora', sans-serif" }}>
                      Remember me
                    </Typography>
                  }
                />
                <Typography
                  sx={{ fontSize: "0.825rem", color: ACCENT, cursor: "pointer", fontWeight: 500, fontFamily: "'Sora', sans-serif", "&:hover": { textDecoration: "underline" } }}
                >
                  Forgot password?
                </Typography>
              </Box>

              <Button
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                endIcon={!loading && <ArrowForwardIcon sx={{ fontSize: "1rem !important" }} />}
                onClick={handleLogin}
                sx={{
                  mt: 0.5,
                  borderRadius: "12px",
                  py: 1.6,
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  fontFamily: "'Sora', sans-serif",
                  background: `linear-gradient(135deg, ${ACCENT} 0%, #8b5cf6 100%)`,
                  boxShadow: `0 4px 20px rgba(99,102,241,0.3)`,
                  transition: "all 0.25s ease",
                  letterSpacing: "0.01em",
                  "&:hover": { transform: "translateY(-2px)", boxShadow: `0 8px 30px rgba(99,102,241,0.4)` },
                  "&:active": { transform: "translateY(0)" },
                  "&:disabled": { background: "#e2e8f0", color: "#94a3b8", boxShadow: "none" },
                }}
              >
                {loading ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", animation: "spin 0.8s linear infinite" }} />
                    Signing in...
                  </Box>
                ) : "Sign In"}
              </Button>
            </Stack>

            {/* Stats row */}
            <Box sx={{ display: "flex", gap: 3, mt: 5, pt: 4, borderTop: "1px solid #f1f5f9" }}>
              {[
                { num: "50K+", label: "Active users" },
                { num: "99.9%", label: "Uptime" },
                { num: "4.9★", label: "App rating" },
              ].map((s) => (
                <Box key={s.label}>
                  <Typography sx={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.2rem", color: "#0f172a", lineHeight: 1 }}>{s.num}</Typography>
                  <Typography sx={{ fontFamily: "'Sora', sans-serif", fontSize: "0.72rem", color: "#94a3b8", mt: 0.3 }}>{s.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* RIGHT DECORATIVE PANEL */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "space-between",
            width: "44%",
            minHeight: "100vh",
            background: "linear-gradient(145deg, #1e1b4b 0%, #0f172a 40%, #0c1a2e 100%)",
            backgroundSize: "200% 200%",
            animation: "gradientShift 10s ease infinite",
            p: 6,
            position: "relative",
            overflow: "hidden",
            order: 1,
          }}
        >
          <Box sx={{ position: "absolute", top: "5%", left: "-10%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)", filter: "blur(50px)" }} />
          <Box sx={{ position: "absolute", bottom: "10%", right: "-5%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.18) 0%, transparent 70%)", filter: "blur(40px)" }} />
          <Box sx={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

          {/* Logo */}
          <Box sx={{ position: "relative", zIndex: 1, animation: "slideInRight 0.7s ease forwards" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ width: 38, height: 38, borderRadius: "10px", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Box component="span" sx={{ color: "#fff", fontSize: 18, fontWeight: 700, lineHeight: 1 }}>C</Box>
              </Box>
              <Typography sx={{ color: "#fff", fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>ChatSpace</Typography>
            </Box>
          </Box>

          {/* Chat preview mockup */}
          <Box sx={{ position: "relative", zIndex: 1, animation: "slideInRight 0.7s ease 0.1s both" }}>
            <Typography sx={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(1.8rem, 2.5vw, 2.5rem)", color: "#fff", lineHeight: 1.2, mb: 3, fontStyle: "italic" }}>
              Your conversations,{" "}
              <Box component="span" sx={{ background: `linear-gradient(90deg, ${ACCENT2}, #a78bfa)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                beautifully
              </Box>{" "}
              organized
            </Typography>

            {/* Simulated chat UI */}
            <Box sx={{ background: "rgba(255,255,255,0.04)", borderRadius: "20px", p: 3, border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(10px)" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3, pb: 2.5, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <Box sx={{ width: 10, height: 10, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px rgba(74,222,128,0.6)" }} />
                <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", fontFamily: "'Sora', sans-serif" }}>Design Team · 3 online</Typography>
              </Box>
              <Stack spacing={1.5}>
                <ChatBubble text="Hey, just pushed the new mockups 🎨" align="left" delay={0} />
                <ChatBubble text="They look amazing! Love the new nav" align="right" delay={0.5} color="rgba(99,102,241,0.3)" />
                <ChatBubble text="Can we ship this Friday? 🚀" align="left" delay={1} />
                <ChatBubble text="Absolutely, let's do it!" align="right" delay={1.5} color="rgba(99,102,241,0.3)" />
              </Stack>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 3, pt: 2.5, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <Box sx={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: "10px", px: 2, py: 1 }}>
                  <Typography sx={{ color: "rgba(255,255,255,0.25)", fontSize: "0.8rem", fontFamily: "'Sora', sans-serif" }}>Type a message...</Typography>
                </Box>
                <Box sx={{ width: 34, height: 34, borderRadius: "10px", background: `linear-gradient(135deg, ${ACCENT}, #8b5cf6)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ArrowForwardIcon sx={{ fontSize: "1rem", color: "#fff" }} />
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Bottom tagline */}
          <Box sx={{ position: "relative", zIndex: 1, animation: "slideInRight 0.7s ease 0.2s both" }}>
            <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", fontFamily: "'Sora', sans-serif", lineHeight: 1.6 }}>
              Trusted by teams at{" "}
              {["Stripe", "Linear", "Vercel", "Notion"].map((co, i) => (
                <Box key={co} component="span" sx={{ color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>
                  {co}{i < 3 ? ", " : ""}
                </Box>
              ))}
              {" "}and more.
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default LoginPage;