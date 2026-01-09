import { useEffect, useState } from "react";
import {
    Box,
    TextField,
    Typography,
    Paper,
    Stack,
    List,
    ListItem,
    ListItemText,
    InputAdornment,
    Button,
    Avatar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import ChatBox from "../../components/ChatBox";

const DashboardPage = () => {
    const navigate = useNavigate();
    const [selectedChat, setSelectedChat] = useState(null);
    const BASE_URL = process.env.REACT_APP_API_URL;



    const [text, setText] = useState("");
    const [searchName, setSearchName] = useState("");
    const [users, setUsers] = useState([]);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem("token");

    /* =======================
       AUTH GUARD
    ======================= */
    useEffect(() => {
        const user = localStorage.getItem("user");

        if (!token || !user) {
            navigate("/login", { replace: true });
            return;
        }

        try {
            const parsedUser = JSON.parse(user);
            setName(parsedUser.name);
        } catch {
            localStorage.clear();
            navigate("/login", { replace: true });
        }
    }, [navigate, token]);

    /* =======================
       DEBOUNCE SEARCH INPUT
    ======================= */
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchName(text.trim());
        }, 600);

        return () => clearTimeout(timer);
    }, [text]);

    /* =======================
       FETCH USERS
    ======================= */
    useEffect(() => {
        if (!searchName) {
            setUsers([]);
            return;
        }

        fetchUsers(searchName);
    }, [searchName]);

    const fetchUsers = async (query) => {
        setLoading(true);

        try {
            const response = await fetch(
                `${BASE_URL}/api/users/search?q=${query}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch users");
            }

            const result = await response.json();
            setUsers(result);
        } catch (err) {
            console.error(err.message);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    /* =======================
       LOGOUT
    ======================= */
    const handleLogout = () => {
        localStorage.clear();
        navigate("/login", { replace: true });
    };

    const openChat = async (userId) => {
        try {
            const response = await fetch(
                `${BASE_URL}/api/chats`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ userId }),
                }
            );

            const chat = await response.json();
            setSelectedChat(chat); // 🔥 OPEN CHAT
        } catch (err) {
            console.error("Failed to open chat", err);
        }
    };


    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "#f4f6f8",
                p: { xs: 2, sm: 4 },
            }}
        >
            <Paper
                elevation={4}
                sx={{
                    maxWidth: 650,
                    mx: "auto",
                    p: { xs: 2, sm: 4 },
                    borderRadius: 3,
                }}
            >
                {/* HEADER */}
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={3}
                >
                    <Typography variant="h5" fontWeight="bold">
                        Welcome, {name} 👋
                    </Typography>

                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<LogoutIcon />}
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </Box>

                {/* SEARCH */}
                <TextField
                    fullWidth
                    placeholder="Search users..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                />

                {searchName && (
                    <Typography variant="body2" color="text.secondary" mt={1}>
                        Searching for: <strong>{searchName}</strong>
                    </Typography>
                )}

                {/* USER LIST */}
                <Stack mt={3}>
                    {loading ? (
                        <Typography textAlign="center" color="text.secondary">
                            Searching users...
                        </Typography>
                    ) : users.length > 0 ? (
                        <List>
                            {users.map((user) => (
                                <ListItem
                                    key={user._id}
                                    onClick={() => openChat(user._id)}
                                    sx={{
                                        borderRadius: 2,
                                        mb: 1,
                                        px: 2,
                                        py: 1.5,
                                        backgroundColor: "#fff",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                                        cursor: "pointer",
                                        "&:hover": {
                                            backgroundColor: "#e3f2fd",
                                        },
                                    }}
                                >
                                    <Avatar sx={{ mr: 2, bgcolor: "#1976d2" }}>
                                        {user.name[0]}
                                    </Avatar>
                                    <ListItemText
                                        primary={user.name}
                                        secondary="Click to chat"
                                    />
                                </ListItem>


                            ))}
                        </List>
                    ) : (
                        searchName && (
                            <Typography
                                textAlign="center"
                                color="text.secondary"
                                mt={2}
                            >
                                No users found
                            </Typography>
                        )
                    )}
                </Stack>
            </Paper>
            {selectedChat && (
                <Box
                    sx={{
                        position: "fixed",
                        bottom: 24,
                        right: 24,
                        width: 360,
                        zIndex: 1300,
                    }}
                >
                    <ChatBox
                        chat={selectedChat}
                        onClose={() => setSelectedChat(null)}
                    />
                </Box>
            )}


        </Box>
    );
};

export default DashboardPage;
