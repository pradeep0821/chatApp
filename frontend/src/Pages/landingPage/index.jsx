import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Box, Button, Typography, Stack } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  @keyframes aurora {
    0%   { transform: translate(0,0) scale(1); }
    33%  { transform: translate(6%,-4%) scale(1.08); }
    66%  { transform: translate(-4%,5%) scale(0.95); }
    100% { transform: translate(0,0) scale(1); }
  }
  @keyframes aurora2 {
    0%   { transform: translate(0,0) scale(1.05); }
    50%  { transform: translate(-7%, 6%) scale(0.92); }
    100% { transform: translate(0,0) scale(1.05); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes float {
    0%,100% { transform: translateY(0px) rotate(0deg); }
    50%      { transform: translateY(-18px) rotate(2deg); }
  }
  @keyframes fadeSlideUp {
    from { opacity:0; transform:translateY(28px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  @keyframes orb {
    0%,100% { transform: scale(1); opacity:0.7; }
    50%      { transform: scale(1.15); opacity:1; }
  }
  @keyframes dash {
    from { stroke-dashoffset: 800; }
    to   { stroke-dashoffset: 0; }
  }
`;

const Particle = ({ style }) => (
  <Box sx={{
    position: "absolute",
    borderRadius: "50%",
    background: "rgba(52,211,153,0.15)",
    ...style,
    animation: `float ${3 + Math.random()*3}s ease-in-out infinite`,
  }} />
);

export default function LandingPage() {
  const [hovered, setHovered] = useState(null);
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(()=>setTick(v=>v+1),2800); return ()=>clearInterval(t); }, []);

  const words = ["Secure.", "Instant.", "Beautiful."];

  return (
    <>
      <style>{G}</style>
      <Box sx={{
        minHeight: "100vh",
        background: "#080c14",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Outfit', sans-serif",
        position: "relative",
        overflow: "hidden",
        px: 2,
      }}>
        {/* Aurora blobs */}
        <Box sx={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
          <Box sx={{ position:"absolute", top:"-20%", left:"-10%", width:"60%", height:"60%", borderRadius:"50%",
            background:"radial-gradient(ellipse, rgba(16,185,129,0.18) 0%, transparent 70%)",
            animation:"aurora 14s ease-in-out infinite", filter:"blur(60px)" }} />
          <Box sx={{ position:"absolute", bottom:"-10%", right:"-15%", width:"55%", height:"55%", borderRadius:"50%",
            background:"radial-gradient(ellipse, rgba(6,182,212,0.14) 0%, transparent 70%)",
            animation:"aurora2 18s ease-in-out infinite", filter:"blur(70px)" }} />
          <Box sx={{ position:"absolute", top:"40%", left:"40%", width:"35%", height:"35%", borderRadius:"50%",
            background:"radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 70%)",
            animation:"aurora 22s ease-in-out infinite 4s", filter:"blur(50px)" }} />
        </Box>

        {/* Grid overlay */}
        <Box sx={{ position:"absolute", inset:0, backgroundImage:`
          linear-gradient(rgba(52,211,153,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(52,211,153,0.04) 1px, transparent 1px)`,
          backgroundSize:"60px 60px", pointerEvents:"none" }} />

        {/* Floating particles */}
        {[
          { top:"15%", left:"8%",  width:6,  height:6  },
          { top:"70%", left:"5%",  width:4,  height:4  },
          { top:"25%", right:"10%",width:8,  height:8  },
          { top:"60%", right:"7%", width:5,  height:5  },
          { top:"45%", left:"20%", width:3,  height:3  },
          { top:"80%", right:"20%",width:6,  height:6  },
        ].map((s,i)=><Particle key={i} style={{...s, animationDelay:`${i*0.5}s`}} />)}

        {/* Main card */}
        <Box sx={{
          position:"relative", zIndex:2,
          animation:"fadeSlideUp 0.8s ease forwards",
          textAlign:"center", maxWidth:520, width:"100%",
        }}>
          {/* Logo mark */}
          <Box sx={{ position:"relative", display:"inline-block", mb:4, animation:"float 6s ease-in-out infinite" }}>
            <Box sx={{
              width:88, height:88, borderRadius:"28px",
              background:"linear-gradient(135deg, #10b981, #0891b2)",
              display:"flex", alignItems:"center", justifyContent:"center",
              mx:"auto",
              boxShadow:"0 0 0 1px rgba(52,211,153,0.3), 0 20px 60px rgba(16,185,129,0.35)",
            }}>
              <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
                <path d="M8 14h26M8 21h18M8 28h22" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="34" cy="28" r="6" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1.5"/>
                <path d="M31.5 28l2 2 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Box>
            {/* Orbiting dot */}
            <Box sx={{
              position:"absolute", top:-4, right:-4,
              width:16, height:16, borderRadius:"50%",
              background:"linear-gradient(135deg, #34d399, #06b6d4)",
              boxShadow:"0 0 12px rgba(52,211,153,0.8)",
              animation:"pulse 2s ease-in-out infinite",
            }} />
          </Box>

          {/* Brand name */}
          <Typography sx={{
            fontFamily:"'Playfair Display', serif",
            fontSize:"clamp(2.8rem, 6vw, 4rem)",
            fontWeight:700,
            color:"#fff",
            lineHeight:1,
            mb:1.5,
            letterSpacing:"-0.03em",
          }}>
            Chat<Box component="span" sx={{
              fontStyle:"italic",
              background:"linear-gradient(90deg, #34d399, #06b6d4, #34d399)",
              backgroundSize:"200% auto",
              WebkitBackgroundClip:"text",
              WebkitTextFillColor:"transparent",
              animation:"shimmer 3s linear infinite",
            }}>Sphere</Box>
          </Typography>

          {/* Rotating tagline word */}
          <Box sx={{ height:40, overflow:"hidden", mb:5 }}>
            <Typography sx={{
              fontFamily:"'Outfit', sans-serif",
              fontSize:"1.15rem",
              color:"rgba(255,255,255,0.45)",
              fontWeight:300,
              display:"flex", alignItems:"center", justifyContent:"center", gap:1,
            }}>
              Connect instantly.{" "}
              <Box component="span" sx={{
                color:"#34d399",
                fontWeight:600,
                display:"inline-block",
                animation:"fadeSlideUp 0.4s ease forwards",
                key: tick,
              }}>
                {words[tick % words.length]}
              </Box>
            </Typography>
          </Box>

          {/* Buttons */}
          <Stack spacing={2} sx={{ mb:5 }}>
            <Button
              component={Link} to="/signup"
              fullWidth
              endIcon={<ArrowForwardIcon />}
              onMouseEnter={()=>setHovered("signup")}
              onMouseLeave={()=>setHovered(null)}
              sx={{
                borderRadius:"16px",
                py:1.8,
                fontFamily:"'Outfit', sans-serif",
                fontWeight:600,
                fontSize:"1rem",
                background: hovered==="signup"
                  ? "linear-gradient(135deg, #059669, #0891b2)"
                  : "linear-gradient(135deg, #10b981, #0891b2)",
                color:"#fff",
                border:"1px solid rgba(52,211,153,0.3)",
                boxShadow: hovered==="signup"
                  ? "0 8px 40px rgba(16,185,129,0.5), inset 0 1px 0 rgba(255,255,255,0.15)"
                  : "0 4px 20px rgba(16,185,129,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
                transform: hovered==="signup" ? "translateY(-3px)" : "none",
                transition:"all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                letterSpacing:"0.01em",
                textTransform:"none",
              }}
            >
              Start for free
            </Button>

            <Button
              component={Link} to="/login"
              fullWidth
              onMouseEnter={()=>setHovered("login")}
              onMouseLeave={()=>setHovered(null)}
              sx={{
                borderRadius:"16px",
                py:1.8,
                fontFamily:"'Outfit', sans-serif",
                fontWeight:500,
                fontSize:"1rem",
                background: hovered==="login" ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)",
                color:"rgba(255,255,255,0.8)",
                border:"1px solid rgba(255,255,255,0.1)",
                transform: hovered==="login" ? "translateY(-2px)" : "none",
                transition:"all 0.25s ease",
                textTransform:"none",
                backdropFilter:"blur(10px)",
              }}
            >
              Sign in to your account
            </Button>
          </Stack>

          {/* Social proof */}
          <Box sx={{ display:"flex", alignItems:"center", justifyContent:"center", gap:2 }}>
            <Box sx={{ display:"flex" }}>
              {["#10b981","#0891b2","#6366f1","#f59e0b"].map((c,i)=>(
                <Box key={i} sx={{
                  width:28, height:28, borderRadius:"50%",
                  background:`linear-gradient(135deg, ${c}, ${c}aa)`,
                  border:"2px solid #080c14",
                  ml: i===0 ? 0 : "-8px",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"0.65rem", color:"#fff", fontWeight:700,
                }}>
                  {["A","K","S","M"][i]}
                </Box>
              ))}
            </Box>
            <Typography sx={{ color:"rgba(255,255,255,0.35)", fontSize:"0.8rem", fontFamily:"'Outfit', sans-serif" }}>
              <Box component="span" sx={{ color:"#34d399", fontWeight:600 }}>2,400+</Box> people chatting today
            </Typography>
          </Box>
        </Box>

        {/* Corner decorations */}
        <Box sx={{ position:"absolute", bottom:24, left:24, opacity:0.3 }}>
          <Typography sx={{ fontSize:"0.7rem", color:"rgba(52,211,153,0.6)", fontFamily:"'Outfit', sans-serif", letterSpacing:"0.15em" }}>
            CHATSPHERE v2.0
          </Typography>
        </Box>
        <Box sx={{ position:"absolute", bottom:24, right:24, display:"flex", gap:1.5, opacity:0.4 }}>
          {[0,1,2].map(i=><Box key={i} sx={{ width:6, height:6, borderRadius:"50%", background:`rgba(52,211,153,${0.3+i*0.25})`, animation:`pulse 2s ease-in-out infinite`, animationDelay:`${i*0.4}s` }} />)}
        </Box>
      </Box>
    </>
  );
}