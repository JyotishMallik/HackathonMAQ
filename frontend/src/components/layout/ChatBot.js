import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Box,
    Fab,
    Zoom,
    Paper,
    Typography,
    TextField,
    IconButton,
    List,
    ListItem,
    Avatar,
    Tooltip,
    Grow,
    Badge,
    InputAdornment,
    CircularProgress,
} from '@mui/material';
import {
    Chat as ChatIcon,
    Close as CloseIcon,
    Send as SendIcon,
    Mic as MicIcon,
    SmartToy as BotIcon,
    Person as PersonIcon,
    EmojiEmotions as EmojiIcon,
    AttachFile as AttachIcon,
    Minimize as MinimizeIcon,
    MoreVert as MoreVertIcon,
    Code as CodeIcon,
} from '@mui/icons-material';
import chatbotService from '../../services/chatbotService';

const ChatBot = () => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [processingVoice, setProcessingVoice] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const chatEndRef = useRef(null);
    const location = useLocation();
    const chatInputRef = useRef(null);

    // Handle toggle chat visibility
    const handleToggleChat = () => {
        if (!open) {
            setUnreadCount(0);
        }
        setOpen(!open);
        setMinimized(false);
    };

    // Handle minimize/maximize chat window
    const handleMinimizeChat = (e) => {
        e.stopPropagation();
        setMinimized(!minimized);
    };

    // Send message to the AI backend
    const handleSendMessage = async () => {
        if (message.trim() === '') return;

        // Add user message to chat
        const userMessage = { text: message, fromUser: true, timestamp: new Date() };
        setChatHistory((prev) => [...prev, userMessage]);
        
        // Clear input field
        const sentMessage = message;
        setMessage('');

        // Show typing indicator
        setIsTyping(true);

        try {
            // Call the backend API
            const response = await chatbotService.sendMessage(sentMessage, location.pathname);
            
            // Hide typing indicator and add response to chat
            setIsTyping(false);
            const botResponse = {
                text: response.message,
                fromUser: false,
                timestamp: new Date(),
                type: response.type || 'text',
                data: response.data
            };
            setChatHistory((prev) => [...prev, botResponse]);

            // Increment unread count if chat is minimized
            if (minimized) {
                setUnreadCount((prev) => prev + 1);
            }
        } catch (error) {
            // Handle error
            setIsTyping(false);
            const errorResponse = {
                text: "I'm sorry, I couldn't process your request right now. Please try again later.",
                fromUser: false,
                timestamp: new Date(),
                isError: true
            };
            setChatHistory((prev) => [...prev, errorResponse]);
            console.error("Error getting response from AI:", error);
        }
    };

    // Initialize voice recording
    const initializeRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            
            recorder.ondataavailable = (e) => {
                setAudioChunks((chunks) => [...chunks, e.data]);
            };

            recorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                await handleVoiceSubmission(audioBlob);
                setAudioChunks([]);
            };

            setMediaRecorder(recorder);
        } catch (error) {
            console.error("Error initializing voice recording:", error);
            alert("Could not access your microphone. Please check your browser permissions.");
        }
    };

    // Handle voice recording
    const handleRecordVoice = () => {
        if (!isRecording) {
            // Start recording
            if (!mediaRecorder) {
                initializeRecording().then(() => {
                    if (mediaRecorder) {
                        mediaRecorder.start();
                        setIsRecording(true);
                    }
                });
            } else {
                mediaRecorder.start();
                setIsRecording(true);
            }
        } else {
            // Stop recording
            if (mediaRecorder && mediaRecorder.state === "recording") {
                mediaRecorder.stop();
                setIsRecording(false);
                setProcessingVoice(true);
            }
        }
    };

    // Process voice recording
    const handleVoiceSubmission = async (audioBlob) => {
        try {
            // Add a temporary message to show processing
            setChatHistory((prev) => [
                ...prev, 
                { text: "🎤 Processing voice input...", fromUser: true, timestamp: new Date(), isProcessing: true }
            ]);
            
            // Send audio to backend for processing
            const response = await chatbotService.processVoiceInput(audioBlob, location.pathname);
            
            // Update the chat history with the transcribed text
            setChatHistory((prev) => {
                const newHistory = [...prev];
                // Replace the processing message with the actual transcription
                const lastIndex = newHistory.findIndex(msg => msg.isProcessing);
                if (lastIndex !== -1) {
                    newHistory[lastIndex] = { 
                        text: response.transcription, 
                        fromUser: true, 
                        timestamp: new Date() 
                    };
                }
                return newHistory;
            });
            
            // Show typing indicator for bot response
            setIsTyping(true);
            
            // Slight delay before showing the bot response
            setTimeout(() => {
                setIsTyping(false);
                const botResponse = {
                    text: response.message,
                    fromUser: false,
                    timestamp: new Date(),
                    type: response.type || 'text',
                    data: response.data
                };
                setChatHistory((prev) => [...prev, botResponse]);
            }, 1000);
            
            setProcessingVoice(false);
            
        } catch (error) {
            console.error("Error processing voice input:", error);
            setChatHistory((prev) => {
                const newHistory = [...prev];
                const lastIndex = newHistory.findIndex(msg => msg.isProcessing);
                if (lastIndex !== -1) {
                    newHistory[lastIndex] = { 
                        text: "I couldn't understand the audio. Please try again.", 
                        fromUser: false, 
                        timestamp: new Date(),
                        isError: true
                    };
                }
                return newHistory;
            });
            setProcessingVoice(false);
        }
    };

    // Handle code analysis
    const handleCodeAnalysis = async (code, language, type) => {
        try {
            let response;
            if (type === 'security') {
                response = await chatbotService.analyzeCode(code, language);
            } else {
                response = await chatbotService.checkCodeQuality(code, language);
            }
            
            return response;
        } catch (error) {
            console.error("Error analyzing code:", error);
            throw new Error("Failed to analyze code");
        }
    };

    // Focus the input field when opening the chat
    useEffect(() => {
        if (open && !minimized) {
            setTimeout(() => {
                chatInputRef.current?.focus();
            }, 300);
        }
    }, [open, minimized]);

    // Scroll to bottom of chat when history changes
    useEffect(() => {
        if (!minimized) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatHistory, minimized, isTyping]);

    // Welcome message
    useEffect(() => {
        if (chatHistory.length === 0) {
            setTimeout(() => {
                setChatHistory([{
                    text: "👋 Hello! I'm your AI assistant. I can help with product questions, IT support tickets, FAQ answers, code quality checks, and security reviews. How can I assist you today?",
                    fromUser: false,
                    timestamp: new Date()
                }]);
            }, 1000);
        }
    }, []);

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Render message content based on type
    const renderMessageContent = (chat) => {
        // Handle code snippets
        if (chat.type === 'code') {
            return (
                <Box sx={{ 
                    fontFamily: 'monospace', 
                    backgroundColor: '#1e1e1e',
                    color: '#d4d4d4', 
                    p: 1.5, 
                    borderRadius: 1,
                    overflowX: 'auto',
                    fontSize: '0.85rem'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CodeIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="caption" sx={{ color: '#9cdcfe' }}>
                            {chat.data?.language || 'Code'}
                        </Typography>
                    </Box>
                    {chat.text}
                </Box>
            );
        }
        
        // Handle vulnerability reports
        if (chat.type === 'vulnerability') {
            return (
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                        Security Issues Found:
                    </Typography>
                    <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                        {chat.data?.issues.map((issue, i) => (
                            <li key={i}>
                                <Typography variant="body2">{issue}</Typography>
                            </li>
                        ))}
                    </ul>
                    <Typography variant="body2">{chat.text}</Typography>
                </Box>
            );
        }
        
        // Default text message
        return chat.text;
    };

    return (
        <>
            <Zoom in={!open}>
                <Fab
                    color="primary"
                    aria-label="chat"
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        background: 'linear-gradient(90deg, #3949ab 0%, #5c6bc0 100%)',
                        boxShadow: '0 4px 20px rgba(57, 73, 171, 0.3)',
                        '&:hover': {
                            background: 'linear-gradient(90deg, #3949ab 30%, #5c6bc0 90%)',
                            boxShadow: '0 6px 20px rgba(57, 73, 171, 0.5)',
                        },
                    }}
                    onClick={handleToggleChat}
                >
                    {unreadCount > 0 ? (
                        <Badge color="error" badgeContent={unreadCount}>
                            <ChatIcon />
                        </Badge>
                    ) : (
                        <ChatIcon />
                    )}
                </Fab>
            </Zoom>

            {open && (
                <Grow in={open} timeout={300}>
                    <Paper
                        elevation={8}
                        sx={{
                            position: 'fixed',
                            bottom: 24,
                            right: 24,
                            width: 360,
                            height: minimized ? 'auto' : 500,
                            display: 'flex',
                            flexDirection: 'column',
                            zIndex: 1300,
                            borderRadius: 3,
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                        }}
                    >
                        {/* Chat header */}
                        <Box
                            sx={{
                                p: 2,
                                background: 'linear-gradient(90deg, #1a237e 0%, #3949ab 100%)',
                                color: 'white',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                            onClick={handleMinimizeChat}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar
                                    sx={{
                                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                                        width: 38,
                                        height: 38,
                                        mr: 1.5,
                                        p: 0.5,
                                    }}
                                >
                                    <BotIcon fontSize="small" />
                                </Avatar>
                                <Box>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                                            fontWeight: 600,
                                            fontSize: '1rem',
                                        }}
                                    >
                                        AI Assistant
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            opacity: 0.8,
                                            fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                                            fontSize: '0.75rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        {isTyping ? (
                                            <>
                                                <Box sx={{
                                                    width: 8,
                                                    height: 8,
                                                    bgcolor: '#4caf50',
                                                    borderRadius: '50%',
                                                    mr: 0.8,
                                                    animation: 'pulse 1.5s infinite'
                                                }} />
                                                Typing...
                                            </>
                                        ) : (
                                            <>
                                                <Box sx={{
                                                    width: 8,
                                                    height: 8,
                                                    bgcolor: '#4caf50',
                                                    borderRadius: '50%',
                                                    mr: 0.8
                                                }} />
                                                Online
                                            </>
                                        )}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box>
                                <Tooltip title={minimized ? 'Expand' : 'Minimize'}>
                                    <IconButton
                                        size="small"
                                        color="inherit"
                                        onClick={handleMinimizeChat}
                                        sx={{ opacity: 0.9, '&:hover': { opacity: 1 } }}
                                    >
                                        <MinimizeIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Options">
                                    <IconButton
                                        size="small"
                                        color="inherit"
                                        onClick={(e) => e.stopPropagation()}
                                        sx={{ opacity: 0.9, '&:hover': { opacity: 1 } }}
                                    >
                                        <MoreVertIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Close">
                                    <IconButton
                                        size="small"
                                        color="inherit"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleChat();
                                        }}
                                        sx={{ opacity: 0.9, '&:hover': { opacity: 1 } }}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>

                        {/* Chat messages */}
                        {!minimized && (
                            <List
                                sx={{
                                    flex: 1,
                                    overflowY: 'auto',
                                    p: 2,
                                    backgroundColor: '#f8faff', // Very light blue background
                                    backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(200, 210, 240, 0.15) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(200, 210, 240, 0.1) 2%, transparent 0%)',
                                    backgroundSize: '100px 100px',
                                    '&::-webkit-scrollbar': {
                                        width: '8px',
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        background: 'transparent',
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        background: 'rgba(0,0,0,0.1)',
                                        borderRadius: '4px',
                                    },
                                    '&::-webkit-scrollbar-thumb:hover': {
                                        background: 'rgba(0,0,0,0.2)',
                                    },
                                }}
                            >
                                {chatHistory.length === 0 ? (
                                    <Box
                                        display="flex"
                                        flexDirection="column"
                                        alignItems="center"
                                        justifyContent="center"
                                        height="100%"
                                        sx={{ opacity: 0.7 }}
                                    >
                                        <BotIcon sx={{ fontSize: 70, color: '#3949ab', mb: 2, opacity: 0.8 }} />
                                        <Typography
                                            sx={{
                                                color: '#546e7a',
                                                fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                                                textAlign: 'center',
                                            }}
                                        >
                                            Initializing AI assistant...
                                        </Typography>
                                        <CircularProgress size={20} sx={{ mt: 2, color: '#3949ab' }} />
                                    </Box>
                                ) : (
                                    chatHistory.map((chat, index) => (
                                        <ListItem
                                            key={index}
                                            sx={{
                                                flexDirection: 'column',
                                                alignItems: chat.fromUser ? 'flex-end' : 'flex-start',
                                                py: 0.5,
                                                px: 0,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: chat.fromUser ? 'row-reverse' : 'row',
                                                    alignItems: 'flex-end',
                                                    maxWidth: '80%',
                                                }}
                                            >
                                                {!chat.fromUser && (
                                                    <Avatar
                                                        sx={{
                                                            width: 28,
                                                            height: 28,
                                                            bgcolor: '#3949ab',
                                                            fontSize: '0.8rem',
                                                            mr: 1,
                                                            display: index > 0 && !chatHistory[index - 1].fromUser ? 'none' : 'flex',
                                                        }}
                                                    >
                                                        <BotIcon fontSize="small" />
                                                    </Avatar>
                                                )}
                                                <Box
                                                    sx={{
                                                        backgroundColor: chat.fromUser
                                                            ? '#3949ab'
                                                            : chat.isError ? '#ffebee' : 'white',
                                                        color: chat.fromUser ? 'white' : 
                                                               chat.isError ? '#d32f2f' : '#263238',
                                                        p: 1.5,
                                                        px: 2,
                                                        borderRadius: chat.fromUser
                                                            ? '18px 18px 4px 18px'
                                                            : '18px 18px 18px 4px',
                                                        maxWidth: 'calc(100% - 36px)',
                                                        boxShadow: chat.fromUser
                                                            ? '0 2px 8px rgba(57, 73, 171, 0.15)'
                                                            : '0 2px 8px rgba(0, 0, 0, 0.08)',
                                                        fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                                                        fontSize: '0.95rem',
                                                        lineHeight: 1.5,
                                                        ml: chat.fromUser ? 0 : (index > 0 && !chatHistory[index - 1].fromUser ? 5 : 0),
                                                        mr: chat.fromUser ? (index > 0 && chatHistory[index - 1].fromUser ? 5 : 0) : 0,
                                                        position: 'relative',
                                                        '&::after': chat.fromUser ? {
                                                            content: '""',
                                                            position: 'absolute',
                                                            bottom: 0,
                                                            right: '-8px',
                                                            width: '10px',
                                                            height: '10px',
                                                            backgroundColor: '#3949ab',
                                                            clipPath: 'polygon(0 0, 0% 100%, 100% 100%)',
                                                            display: index > 0 && chatHistory[index - 1].fromUser ? 'none' : 'block',
                                                        } : {
                                                            content: '""',
                                                            position: 'absolute',
                                                            bottom: 0,
                                                            left: '-8px',
                                                            width: '10px',
                                                            height: '10px',
                                                            backgroundColor: chat.isError ? '#ffebee' : 'white',
                                                            clipPath: 'polygon(0 100%, 100% 100%, 100% 0)',
                                                            display: index > 0 && !chatHistory[index - 1].fromUser ? 'none' : 'block',
                                                        },
                                                    }}
                                                >
                                                    {renderMessageContent(chat)}
                                                    <Typography
                                                        component="span"
                                                        variant="caption"
                                                        sx={{
                                                            display: 'block',
                                                            textAlign: 'right',
                                                            color: chat.fromUser ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                                                            mt: 0.5,
                                                            fontSize: '0.7rem',
                                                        }}
                                                    >
                                                        {formatTime(chat.timestamp)}
                                                    </Typography>
                                                </Box>
                                                {chat.fromUser && (
                                                    <Avatar
                                                        sx={{
                                                            width: 28,
                                                            height: 28,
                                                            bgcolor: '#5c6bc0',
                                                            fontSize: '0.8rem',
                                                            ml: 1,
                                                            display: index > 0 && chatHistory[index - 1].fromUser ? 'none' : 'flex',
                                                        }}
                                                    >
                                                        <PersonIcon fontSize="small" />
                                                    </Avatar>
                                                )}
                                            </Box>
                                        </ListItem>
                                    ))
                                )}

                                {isTyping && (
                                    <ListItem
                                        sx={{
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            py: 0.5,
                                            px: 0,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                alignItems: 'flex-end',
                                                maxWidth: '80%',
                                            }}
                                        >
                                            <Avatar
                                                sx={{
                                                    width: 28,
                                                    height: 28,
                                                    bgcolor: '#3949ab',
                                                    fontSize: '0.8rem',
                                                    mr: 1,
                                                    display: chatHistory.length > 0 && !chatHistory[chatHistory.length - 1].fromUser ? 'none' : 'flex',
                                                }}
                                            >
                                                <BotIcon fontSize="small" />
                                            </Avatar>
                                            <Box
                                                sx={{
                                                    backgroundColor: 'white',
                                                    p: 2,
                                                    borderRadius: '18px 18px 18px 4px',
                                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                                                    ml: chatHistory.length > 0 && !chatHistory[chatHistory.length - 1].fromUser ? 5 : 0,
                                                    display: 'flex',
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Box sx={{
                                                        width: 8,
                                                        height: 8,
                                                        bgcolor: '#3949ab',
                                                        borderRadius: '50%',
                                                        animation: 'typing-bounce 1.4s infinite ease-in-out both',
                                                        animationDelay: '0s',
                                                    }} />
                                                    <Box sx={{
                                                        width: 8,
                                                        height: 8,
                                                        bgcolor: '#3949ab',
                                                        borderRadius: '50%',
                                                        animation: 'typing-bounce 1.4s infinite ease-in-out both',
                                                        animationDelay: '0.2s',
                                                    }} />
                                                    <Box sx={{
                                                        width: 8,
                                                        height: 8,
                                                        bgcolor: '#3949ab',
                                                        borderRadius: '50%',
                                                        animation: 'typing-bounce 1.4s infinite ease-in-out both',
                                                        animationDelay: '0.4s',
                                                    }} />
                                                </Box>
                                            </Box>
                                        </Box>
                                    </ListItem>
                                )}

                                <div ref={chatEndRef} />

                                <style>
                                    {`
                    @keyframes typing-bounce {
                      0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
                      40% { transform: scale(1); opacity: 1; }
                    }
                    @keyframes pulse {
                      0% { opacity: 0.6; }
                      50% { opacity: 1; }
                      100% { opacity: 0.6; }
                    }
                  `}
                                </style>
                            </List>
                        )}

                        {/* Chat input */}
                        {!minimized && (
                            <Box
                                sx={{
                                    p: 2,
                                    backgroundColor: 'white',
                                    borderTop: '1px solid',
                                    borderColor: 'rgba(0, 0, 0, 0.06)',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <Tooltip title="Attach a file">
                                    <IconButton
                                        color="primary"
                                        size="small"
                                        sx={{ color: '#5c6bc0' }}
                                    >
                                        <AttachIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <TextField
                                    inputRef={chatInputRef}
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Type your message..."
                                    size="small"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') handleSendMessage();
                                    }}
                                    InputProps={{
                                        sx: {
                                            borderRadius: '24px',
                                            fontSize: '0.95rem',
                                            mx: 1,
                                            bgcolor: '#f5f7fa',
                                            '& fieldset': {
                                                borderColor: 'transparent',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'rgba(0, 0, 0, 0.1) !important',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#3949ab !important',
                                                borderWidth: '1px !important',
                                            },
                                        },
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Tooltip title="Insert emoji">
                                                    <IconButton
                                                        edge="end"
                                                        size="small"
                                                        sx={{ color: '#5c6bc0' }}
                                                    >
                                                        <EmojiIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <Tooltip title={isRecording ? "Stop recording" : "Voice input"}>
                                    <IconButton
                                        color={isRecording ? "error" : "primary"}
                                        onClick={handleRecordVoice}
                                        disabled={processingVoice}
                                        size="small"
                                        sx={{
                                            bgcolor: isRecording ? 'rgba(244, 67, 54, 0.1)' : 'transparent',
                                            '&:hover': {
                                                bgcolor: isRecording ? 'rgba(244, 67, 54, 0.15)' : 'rgba(57, 73, 171, 0.1)',
                                            },
                                        }}
                                    >
                                        {processingVoice ? (
                                            <CircularProgress size={20} />
                                        ) : (
                                            <MicIcon fontSize="small" />
                                        )}
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Send message">
                                    <span>
                                        <IconButton
                                            color="primary"
                                            onClick={handleSendMessage}
                                            disabled={!message.trim()}
                                            size="small"
                                            sx={{
                                                ml: 0.5,
                                                bgcolor: message.trim() ? '#3949ab' : 'transparent',
                                                color: message.trim() ? 'white' : 'rgba(0, 0, 0, 0.26)',
                                                '&:hover': {
                                                    bgcolor: message.trim() ? '#303f9f' : 'transparent',
                                                },
                                                transition: 'all 0.2s ease',
                                            }}
                                        >
                                            <SendIcon fontSize="small" />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </Box>
                        )}
                    </Paper>
                </Grow>
            )}
        </>
    );
};

export default ChatBot;