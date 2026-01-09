import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
  Link,
} from "@mui/material";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";

const SignupPage = () => {
  const BASE_URL = process.env.REACT_APP_API_URL;

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSignup = async () => {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      }),
    });

    const result = await response.json();
    console.log("result", result);

    if (result.statusCode === 200) {
      navigate("/login");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Paper
        elevation={12}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 420,
          borderRadius: 4,
        }}
      >
        <Box textAlign="center" mb={3}>
          <PersonAddAltIcon
            sx={{ fontSize: 48, color: "#667eea", mb: 1 }}
          />
          <Typography variant="h5" fontWeight="bold">
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Join the chat and start conversations
          </Typography>
        </Box>

        <Stack spacing={2}>
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
          />

          <Button
            variant="contained"
            size="large"
            sx={{ borderRadius: 3, py: 1.2 }}
            onClick={handleSignup}
          >
            Signup
          </Button>
        </Stack>

        <Typography
          variant="body2"
          textAlign="center"
          mt={3}
          color="text.secondary"
        >
          Already have an account?{" "}
          <Link
            component="button"
            underline="none"
            fontWeight="bold"
            onClick={() => navigate("/login")}
          >
            Login
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default SignupPage;
