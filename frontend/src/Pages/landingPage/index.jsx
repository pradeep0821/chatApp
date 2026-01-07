import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Paper,
  Stack
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: 5,
          width: 380,
          borderRadius: 4,
          textAlign: "center",
        }}
      >
        <ChatIcon sx={{ fontSize: 60, color: "#667eea", mb: 1 }} />

        <Typography variant="h4" fontWeight="bold" gutterBottom>
          ChatSphere
        </Typography>

        <Typography variant="body1" color="text.secondary" mb={4}>
          Connect instantly. Chat securely. Anytime, anywhere.
        </Typography>

        <Stack spacing={2}>
          <Button
            variant="contained"
            size="large"
            startIcon={<PersonAddIcon />}
            sx={{ borderRadius: 3 }}
            onClick={() => navigate("/signup")}
          >
            Signup
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<LoginIcon />}
            sx={{ borderRadius: 3 }}
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default LandingPage;
