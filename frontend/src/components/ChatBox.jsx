import { useEffect, useRef, useState } from "react";
import {
    Box,
    TextField,
    IconButton,
    Typography,
    Paper,
    Avatar
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import socket from "../socket";

const ChatBox = ({ chat, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [currentUser, setCurrentUser] = useState(null);

    const token = localStorage.getItem("token");
    const messagesEndRef = useRef(null);

    /* =======================
       LOAD CURRENT USER
    ======================= */
    useEffect(() => {
        try {
            const userData = localStorage.getItem("user");
            if (userData) {
                const parsedUser = JSON.parse(userData);
                setCurrentUser({
                    ...parsedUser,
                    _id: parsedUser._id || parsedUser.id
                });

            }
        } catch (error) {
            console.error("Error parsing user from localStorage:", error);
        }
    }, []);

    /* =======================
       AUTO SCROLL
    ======================= */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    /* =======================
       LOAD OLD MESSAGES
    ======================= */
    useEffect(() => {
        if (!chat?._id || !token) return;

        fetch(`http://localhost:5000/api/messages/${chat._id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(res => res.json())
            .then(data => {
                setMessages(data);
            })
            .catch(error => console.error("Error loading messages:", error));

        socket.emit("join_chat", chat._id);

        return () => {
            socket.emit("leave_chat", chat._id);
        };
    }, [chat._id, token]);

    /* =======================
       RECEIVE REAL-TIME MSG
    ======================= */
    useEffect(() => {
        socket.on("receive_message", (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        return () => socket.off("receive_message");
    }, []);

    /* =======================
       SEND MESSAGE
    ======================= */
    const sendMessage = async () => {
        if (!text.trim() || !currentUser) return;

        try {
            const response = await fetch("http://localhost:5000/api/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    chatId: chat._id,
                    text,
                }),
            });

            const message = await response.json();

            socket.emit("send_message", message);
            setMessages(prev => [...prev, message]);
            setText("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };



    return (
        <Paper
            elevation={10}
            sx={{
                mt: 3,
                borderRadius: 4,
                height: 480,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}
        >
            {/* HEADER */}
            <Box
                sx={{
                    p: 2,
                    background: "linear-gradient(90deg, #1976d2, #42a5f5)",
                    color: "#fff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Typography fontWeight="bold">
                    {chat.users?.length > 0
                        ? `Chat with ${chat.users.find(u => u._id !== currentUser?._id)?.name || "User"}`
                        : "Chat"}
                </Typography>
                <IconButton onClick={onClose} sx={{ color: "#fff" }}>
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* MESSAGES CONTAINER */}
            <Box
                flex={1}
                p={2}
                sx={{
                    overflowY: "auto",
                    backgroundColor: "#f4f6f8",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {messages.map((msg, i) => {
                    // Check if currentUser is loaded and compare IDs
                    const senderId =
                        typeof msg.sender === "object"
                            ? msg.sender._id
                            : msg.sender;

                    const isMe =
                        currentUser &&
                        senderId &&
                        String(senderId) === String(currentUser._id);

                    return (
                        <Box
                            key={msg._id || i}
                            sx={{
                                display: "flex",
                                justifyContent: isMe ? "flex-end" : "flex-start",
                                alignItems: "flex-end",
                                mb: 2,
                                width: "100%"
                            }}
                        >
                            {/* Other user's avatar on left */}
                            {!isMe && msg.sender && (
                                <Avatar
                                    sx={{
                                        mr: 1,
                                        width: 32,
                                        height: 32,
                                        bgcolor: "#90caf9",
                                        fontSize: "0.875rem"
                                    }}
                                >
                                    {msg.sender?.name?.[0]?.toUpperCase() || "?"}
                                </Avatar>
                            )}

                            {/* Message bubble */}
                            <Box
                                sx={{
                                    maxWidth: "70%",
                                    px: 2,
                                    py: 1,
                                    borderRadius: 3,
                                    backgroundColor: isMe ? "#1976d2" : "#ffffff",
                                    color: isMe ? "#ffffff" : "#000000",
                                    boxShadow: 1,
                                    borderTopLeftRadius: isMe ? 18 : 4,
                                    borderTopRightRadius: isMe ? 4 : 18,
                                    borderBottomLeftRadius: 18,
                                    borderBottomRightRadius: 18,
                                }}
                            >
                                {/* Sender name for other users */}
                                {!isMe && msg.sender && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            display: "block",
                                            color: "#666",
                                            fontWeight: 600,
                                            mb: 0.5
                                        }}
                                    >
                                        {msg.sender?.name}
                                    </Typography>
                                )}

                                {/* Message text */}
                                <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                                    {msg.text}
                                </Typography>

                                {/* Message time */}
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: "block",
                                        textAlign: "right",
                                        color: isMe ? "rgba(255,255,255,0.7)" : "#999",
                                        fontSize: "0.7rem",
                                        mt: 0.5
                                    }}
                                >
                                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : "Now"}
                                </Typography>
                            </Box>

                            {/* Current user's avatar on right */}
                            {isMe && currentUser && (
                                <Avatar
                                    sx={{
                                        ml: 1,
                                        width: 32,
                                        height: 32,
                                        bgcolor: "#42a5f5",
                                        fontSize: "0.875rem"
                                    }}
                                >
                                    {currentUser?.name?.[0]?.toUpperCase() || "U"}
                                </Avatar>
                            )}
                        </Box>
                    );
                })}
                <div ref={messagesEndRef} />
            </Box>

            {/* INPUT AREA */}
            <Box
                p={2}
                display="flex"
                alignItems="center"
                sx={{
                    borderTop: "1px solid #e0e0e0",
                    backgroundColor: "#ffffff"
                }}
            >
                <TextField
                    fullWidth
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    size="small"
                    multiline
                    maxRows={3}
                    disabled={!currentUser}
                    sx={{
                        backgroundColor: "#f9f9f9",
                        borderRadius: 2,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                        }
                    }}
                />
                <IconButton
                    onClick={sendMessage}
                    color="primary"
                    disabled={!text.trim() || !currentUser}
                    sx={{
                        ml: 1,
                        backgroundColor: "#1976d2",
                        color: "white",
                        '&:hover': {
                            backgroundColor: "#1565c0"
                        },
                        '&.Mui-disabled': {
                            backgroundColor: "#e0e0e0",
                            color: "#9e9e9e"
                        }
                    }}
                >
                    <SendIcon />
                </IconButton>
            </Box>
        </Paper>
    );
};

export default ChatBox;