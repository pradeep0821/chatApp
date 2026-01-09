import React, { useState } from "react";
import { jwtDecode } from "jwt-decode"
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Stack
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const LoginPage = () => {
    const BASE_URL = process.env.REACT_APP_API_URL;

    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    const hanldeLogin = async () => {
        if (!formData.email || !formData.password) {
            alert("All fields are required");
            return;
        }

        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message);
            return;
        }

        // Store token
        localStorage.setItem("token", result.token);

        // Decode token
        const decoded = jwtDecode(result.token);

        // Store minimal user info
        localStorage.setItem(
            "user",
            JSON.stringify({
                id: decoded.id,
                name: decoded.name,
            })
        );

        navigate("/dashboard");
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
                    maxWidth: 400,
                    borderRadius: 4,
                }}
            >
                <Box textAlign="center" mb={3}>
                    <LockOutlinedIcon
                        sx={{ fontSize: 48, color: "#667eea", mb: 1 }}
                    />
                    <Typography variant="h5" fontWeight="bold">
                        Welcome Back
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Login to continue chatting
                    </Typography>
                </Box>

                <Stack spacing={2}>
                    <TextField
                        label="Email"
                        name="email"
                        value={formData.email || ""}
                        onChange={handleChange}
                        fullWidth
                        required
                    />

                    <TextField
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password || ""}
                        onChange={handleChange}
                        required
                        fullWidth
                    />

                    <Button
                        variant="contained"
                        size="large"
                        sx={{
                            mt: 1,
                            borderRadius: 3,
                            py: 1.2,
                        }}
                        onClick={hanldeLogin}
                    >
                        Login
                    </Button>
                </Stack>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    mt={3}
                >
                    Secure real-time messaging
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    mt={3}
                >
                    <a href="/signup">Not have an Account?</a>
                </Typography>
            </Paper>
        </Box>
    );
};

export default LoginPage;
