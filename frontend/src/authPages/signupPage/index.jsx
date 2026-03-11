import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Alert,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import GoogleIcon from "@mui/icons-material/Google";

const ACCENT = "#0ea5e9";
const ACCENT2 = "#6366f1";

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
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const FeatureDot = ({ color }) => (
  <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
);

const SignupPage = () => {
  const BASE_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");

  const handleSignup = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.statusCode === 200 || response.ok) {
        navigate("/login");
      } else {
        setError(result.message || "Registration failed");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const inputSx = (fieldName) => ({
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      fontFamily: "'Sora', sans-serif",
      fontSize: "0.9rem",
      background: focused === fieldName ? "rgba(14,165,233,0.04)" : "#fafafa",
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
        {/* LEFT PANEL */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "space-between",
            width: "44%",
            minHeight: "100vh",
            background: "linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #0c1445 100%)",
            backgroundSize: "200% 200%",
            animation: "gradientShift 8s ease infinite",
            p: 6,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box sx={{ position: "absolute", top: "8%", right: "-10%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)", filter: "blur(40px)" }} />
          <Box sx={{ position: "absolute", bottom: "15%", left: "-5%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 70%)", filter: "blur(40px)" }} />
          <Box sx={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

          <Box sx={{ position: "relative", zIndex: 1, animation: "slideInLeft 0.7s ease forwards" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ width: 38, height: 38, borderRadius: "10px", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Box component="span" sx={{ color: "#fff", fontSize: 18, fontWeight: 700, lineHeight: 1 }}>C</Box>
              </Box>
              <Typography sx={{ color: "#fff", fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>ChatSpace</Typography>
            </Box>
          </Box>

          <Box sx={{ position: "relative", zIndex: 1, animation: "slideInLeft 0.7s ease 0.1s both" }}>
            <Typography sx={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(2rem, 3vw, 2.8rem)", color: "#fff", lineHeight: 1.15, mb: 2.5, fontStyle: "italic" }}>
              Connect with people who{" "}
              <Box component="span" sx={{ background: `linear-gradient(90deg, ${ACCENT}, #a78bfa)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                matter
              </Box>
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.95rem", lineHeight: 1.7, fontWeight: 300 }}>
              Join thousands of people having real conversations in a space built for clarity and connection.
            </Typography>
            <Stack spacing={2} sx={{ mt: 4 }}>
              {[
                { dot: ACCENT, text: "End-to-end encrypted messages" },
                { dot: "#a78bfa", text: "Real-time group conversations" },
                { dot: "#34d399", text: "Cross-platform, always in sync" },
              ].map((f) => (
                <Box key={f.text} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <FeatureDot color={f.dot} />
                  <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.875rem", fontFamily: "'Sora', sans-serif" }}>{f.text}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box sx={{ position: "relative", zIndex: 1, animation: "slideInLeft 0.7s ease 0.2s both" }}>
            <Box sx={{ background: "rgba(255,255,255,0.06)", borderRadius: "16px", p: 3, border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
              <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.875rem", lineHeight: 1.6, fontStyle: "italic", mb: 2 }}>
                "The cleanest chat interface I've used. My team moved here permanently."
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography sx={{ color: "#fff", fontSize: "0.75rem", fontWeight: 600 }}>SL</Typography>
                </Box>
                <Box>
                  <Typography sx={{ color: "#fff", fontSize: "0.8rem", fontWeight: 600 }}>Sarah L.</Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>Product Lead, Vercel</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* RIGHT PANEL */}
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
          }}
        >
          <Box sx={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 80% 20%, rgba(14,165,233,0.05) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(99,102,241,0.05) 0%, transparent 50%)", pointerEvents: "none" }} />

          <Box sx={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1, animation: "slideInRight 0.7s ease forwards" }}>
            {/* Mobile logo */}
            <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1.5, mb: 5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: "10px", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Box component="span" sx={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>C</Box>
              </Box>
              <Typography sx={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: "1rem", color: "#0f172a" }}>ChatSpace</Typography>
            </Box>

            <Box sx={{ mb: 5 }}>
              <Typography sx={{ fontFamily: "'DM Serif Display', serif", fontSize: "2rem", color: "#0f172a", lineHeight: 1.2, mb: 1 }}>
                Create your account
              </Typography>
              <Typography sx={{ color: "#94a3b8", fontSize: "0.9rem", fontFamily: "'Sora', sans-serif" }}>
                Already have one?{" "}
                <Link to="/login" style={{ color: ACCENT, textDecoration: "none", fontWeight: 600 }}>Sign in →</Link>
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
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onFocus={() => setFocused("name")}
                onBlur={() => setFocused("")}
                fullWidth
                placeholder="John Doe"
                InputProps={{ startAdornment: <Box sx={{ mr: 1, display: "flex", opacity: 0.4 }}><PersonIcon sx={{ fontSize: "1.1rem" }} /></Box> }}
                sx={inputSx("name")}
              />
              <TextField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused("")}
                fullWidth
                placeholder="you@example.com"
                InputProps={{ startAdornment: <Box sx={{ mr: 1, display: "flex", opacity: 0.4 }}><EmailIcon sx={{ fontSize: "1.1rem" }} /></Box> }}
                sx={inputSx("email")}
              />
              <TextField
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused("")}
                fullWidth
                placeholder="Min. 6 characters"
                InputProps={{ startAdornment: <Box sx={{ mr: 1, display: "flex", opacity: 0.4 }}><LockIcon sx={{ fontSize: "1.1rem" }} /></Box> }}
                sx={inputSx("password")}
              />

              {formData.password.length > 0 && (
                <Box sx={{ animation: "fadeUp 0.3s ease forwards" }}>
                  <Box sx={{ display: "flex", gap: 0.75, mb: 0.5 }}>
                    {[1, 2, 3, 4].map((i) => (
                      <Box key={i} sx={{ flex: 1, height: 3, borderRadius: "2px", background: formData.password.length >= i * 3 ? (i <= 1 ? "#f87171" : i <= 2 ? "#fb923c" : i <= 3 ? "#facc15" : "#4ade80") : "#e2e8f0", transition: "background 0.3s ease" }} />
                    ))}
                  </Box>
                  <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", fontFamily: "'Sora', sans-serif" }}>
                    {formData.password.length < 4 ? "Weak" : formData.password.length < 7 ? "Fair" : formData.password.length < 10 ? "Good" : "Strong"} password
                  </Typography>
                </Box>
              )}

              <Button
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                endIcon={!loading && <ArrowForwardIcon sx={{ fontSize: "1rem !important" }} />}
                onClick={handleSignup}
                sx={{
                  mt: 0.5,
                  borderRadius: "12px",
                  py: 1.6,
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  fontFamily: "'Sora', sans-serif",
                  background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT2} 100%)`,
                  boxShadow: `0 4px 20px rgba(14,165,233,0.3)`,
                  transition: "all 0.25s ease",
                  letterSpacing: "0.01em",
                  "&:hover": { transform: "translateY(-2px)", boxShadow: `0 8px 30px rgba(14,165,233,0.4)` },
                  "&:active": { transform: "translateY(0)" },
                  "&:disabled": { background: "#e2e8f0", color: "#94a3b8", boxShadow: "none" },
                }}
              >
                {loading ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", animation: "spin 0.8s linear infinite" }} />
                    Creating account...
                  </Box>
                ) : "Create Account"}
              </Button>
            </Stack>

            <Typography sx={{ textAlign: "center", mt: 4, color: "#cbd5e1", fontSize: "0.78rem", fontFamily: "'Sora', sans-serif", lineHeight: 1.6 }}>
              By creating an account, you agree to our{" "}
              <Box component="span" sx={{ color: ACCENT, cursor: "pointer" }}>Terms</Box>{" "}and{" "}
              <Box component="span" sx={{ color: ACCENT, cursor: "pointer" }}>Privacy Policy</Box>
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default SignupPage;