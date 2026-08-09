// ChatUI.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    AppBar, Avatar, Badge, Box, Button, Chip, Divider, IconButton, InputAdornment,
    List, ListItemButton, ListItemAvatar, ListItemText, Paper, Stack, TextField,
    Toolbar, Tooltip, Typography
} from "@mui/material";
import {
    Search as SearchIcon,
    Add as AddIcon,
    Send as SendIcon,
    Mic as MicIcon,
    EmojiEmotions as EmojiIcon,
    MoreVert as MoreIcon,
    Phone as PhoneIcon,
    Videocam as VideoIcon
} from "@mui/icons-material";
import MainCard from "@components/MainCard";

/** ---------- mock data ---------- */
const contacts = [
    { id: "c1", name: "Dawn Teague", avatar: "https://i.pravatar.cc/100?img=65", online: true, unread: 2, last: "Hello, How are you?" },
    { id: "c2", name: "David Johnson", avatar: "https://i.pravatar.cc/100?img=12", online: true, last: "Here are some of ver..." },
    { id: "c3", name: "Andrew Gilbert", avatar: "https://i.pravatar.cc/100?img=47", online: true, unread: 2, last: "Use tools like Trell..." },
    { id: "c4", name: "Tyron Derby", avatar: "https://i.pravatar.cc/100?img=23", online: true, last: "Regularly review and..." },
    { id: "c5", name: "Susan Liles", avatar: "", initials: "SL", online: true, last: "Schedule regular che..." },
];

const railApps = [
    { id: "r1", icon: "https://api.iconify.design/flat-color-icons:shop.svg?width=40" },
    { id: "r2", icon: "https://api.iconify.design/logos:adobe.svg?width=40" },
    { id: "r3", icon: "https://api.iconify.design/logos:google-ads.svg?width=40" },
    { id: "r4", icon: "https://api.iconify.design/logos:google-analytics.svg?width=40" },
    { id: "r5", icon: "https://api.iconify.design/logos:playstation.svg?width=40" },
    { id: "r6", icon: "https://api.iconify.design/logos:shopify.svg?width=40" },
];

const seedMessages = [
    // earlier messages (truncated)
    { id: "m0", sender: "other", text: "Hello, How are you?", time: Date.now() - 1000 * 60 * 60 * 2.2 },
    // today
    { id: "m1", sender: "me", text: "Sure, starting on it today. Will update you on the progress. #task154", time: Date.now() - 1000 * 60 * 60 * 2 },
    {
        id: "m2", sender: "other",
        text: "Hi Shopia, there’s a problem with the mobile view on the homepage. Images aren’t scaling right. Can someone check? #bug",
        time: Date.now() - 1000 * 60 * 20
    },
];

/** ---------- helpers ---------- */
const makeId = () =>
    (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : `id_${Math.random().toString(36).slice(2)}_${Date.now()}`;

const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/** ---------- UI pieces ---------- */
function OnlineDot({ size = 10 }) {
    return (
        <Box
            sx={{
                width: size, height: size, borderRadius: "50%",
                bgcolor: "success.main", border: "2px solid white", boxShadow: 1
            }}
        />
    );
}

function RailAvatar({ src, alt }) {
    return (
        <Box sx={{ position: "relative" }}>
            <Avatar src={src} alt={alt} sx={{ width: 40, height: 40 }} />
            <Box sx={{ position: "absolute", right: -1, bottom: -1 }}>
                <OnlineDot size={10} />
            </Box>
        </Box>
    );
}

function MessageBubble({ msg, isMine, avatar }) {
    return (
        <Stack direction="row" spacing={1.5} alignItems="flex-end" justifyContent={isMine ? "flex-end" : "flex-start"}>
            {!isMine && (
                <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    variant="dot"
                    color="success"
                >
                    <Avatar src={avatar} sx={{ width: 36, height: 36 }} />
                </Badge>
            )}

            <Paper
                elevation={0}
                sx={(t) => ({
                    px: 2, py: 1.25, maxWidth: { xs: "85%", md: "70%" },
                    borderRadius: 3,
                    borderTopLeftRadius: isMine ? 3 : 1,
                    borderTopRightRadius: isMine ? 1 : 3,
                    bgcolor: isMine ? (t.palette.mode === "dark" ? "primary.dark" : "grey.100") : (t.palette.mode === "dark" ? "grey.800" : "common.white"),
                    border: (isMine ? "1px solid" : "1px solid"),
                    borderColor: (t) => (isMine ? t.palette.divider : t.palette.divider)
                })}
            >
                <Typography variant="body1" sx={{ wordBreak: "break-word" }}>
                    {msg.text}
                </Typography>
                <Typography variant="caption" color="text.secondary">{formatTime(msg.time)}</Typography>
            </Paper>

            {isMine && (
                <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main" }}>Me</Avatar>
            )}
        </Stack>
    );
}

function AttachmentGrid() {
    return (
        <Stack direction="row" spacing={2}>
            <Paper variant="outlined" sx={{ width: 140, height: 90, borderRadius: 2, overflow: "hidden" }}>
                <Box component="img" src="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800" alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </Paper>
            <Paper variant="outlined" sx={{ width: 140, height: 90, borderRadius: 2, overflow: "hidden" }}>
                <Box component="img" src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800" alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </Paper>
            <Paper variant="outlined" sx={{ width: 140, height: 90, borderRadius: 2, display: "grid", placeItems: "center" }}>
                <Typography variant="h6" color="text.secondary">2+</Typography>
            </Paper>
        </Stack>
    );
}

/** ---------- MAIN ---------- */
export default function ChatUI() {
    const [activeContact, setActiveContact] = useState(contacts[0]);
    const [messages, setMessages] = useState(seedMessages);
    const [draft, setDraft] = useState("");
    const scrollRef = useRef(null);

    // auto-scroll xuống cuối
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }, [messages.length]);

    // giả lập reply
    const simulateReply = useMemo(
        () => (text) => {
            const t = setTimeout(() => {
                setMessages((prev) => [
                    ...prev,
                    { id: makeId(), sender: "other", text: "Noted: " + text, time: Date.now() + 1000 },
                ]);
            }, 1200);
            return () => clearTimeout(t);
        },
        []
    );

    const handleSend = () => {
        const text = draft.trim();
        if (!text) return;
        setMessages((prev) => [
            ...prev,
            { id: makeId(), sender: "me", text, time: Date.now() },
        ]);
        setDraft("");
        simulateReply(text);
    };

    return (
        <MainCard >
            <Box sx={{ height: "100vh", display: "grid", gridTemplateColumns: { xs: "1fr", md: "72px 340px 1fr" }, bgcolor: (t) => (t.palette.mode === "dark" ? "background.default" : "grey.50") }}>
                {/* Rail avatar bên trái */}
                <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", alignItems: "center", gap: 2, py: 2, borderRight: (t) => `1px solid ${t.palette.divider}` }}>
                    {railApps.map((r) => (
                        <Box key={r.id} sx={{ position: "relative" }}>
                            <Avatar src={r.icon} variant="rounded" sx={{ width: 44, height: 44, bgcolor: "common.white" }} />
                            <Box sx={{ position: "absolute", right: -2, bottom: -2 }}><OnlineDot /></Box>
                        </Box>
                    ))}
                </Box>

                {/* Danh sách chat */}
                <Box sx={{ borderRight: (t) => `1px solid ${t.palette.divider}`, display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <Box sx={{ p: 2 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search for ..."
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button fullWidth variant="contained" startIcon={<AddIcon />} sx={{ mt: 2, borderRadius: 2 }}>
                            Start New Chat
                        </Button>
                    </Box>
                    <Divider />
                    <Box sx={{ flex: 1, overflow: "auto" }}>
                        <List dense>
                            {contacts.map((c) => (
                                <ListItemButton
                                    key={c.id}
                                    selected={activeContact.id === c.id}
                                    onClick={() => setActiveContact(c)}
                                    sx={{
                                        borderRadius: 2,
                                        mx: 1,
                                        my: 0.5,
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Badge
                                            overlap="circular"
                                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                            variant="dot"
                                            color="success"
                                        >
                                            {c.avatar ? (
                                                <Avatar src={c.avatar} />
                                            ) : (
                                                <Avatar>{c.initials}</Avatar>
                                            )}
                                        </Badge>
                                    </ListItemAvatar>

                                    <ListItemText
                                        primary={
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Typography component="span" fontWeight={700}>{c.name}</Typography>
                                                {c.unread ? <Chip size="small" label={c.unread} color="error" /> : null}
                                            </Stack>
                                        }
                                        secondary={
                                            <Typography component="span" variant="body2" color="text.secondary" noWrap>
                                                {c.last}
                                            </Typography>
                                        }
                                        primaryTypographyProps={{ component: "div" }}
                                        secondaryTypographyProps={{ component: "div" }}
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    </Box>
                </Box>

                {/* Khung chat chính */}
                <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    {/* Header */}
                    <AppBar position="static" elevation={0} color="default" sx={{ borderBottom: (t) => `1px solid ${t.palette.divider}` }}>
                        <Toolbar sx={{ gap: 2 }}>
                            <Badge overlap="circular" variant="dot" color="success" anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                                <Avatar src={activeContact.avatar} />
                            </Badge>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="subtitle1" fontWeight={700} noWrap>{activeContact.name}</Typography>
                                <Typography variant="caption" color="text.secondary">Last seen 2 hr</Typography>
                            </Box>
                            <Tooltip title="Voice call"><IconButton><PhoneIcon /></IconButton></Tooltip>
                            <Tooltip title="Video call"><IconButton><VideoIcon /></IconButton></Tooltip>
                            <Tooltip title="More"><IconButton><MoreIcon /></IconButton></Tooltip>
                        </Toolbar>
                    </AppBar>

                    {/* Messages */}
                    <Box ref={scrollRef} sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                        {/* Ví dụ 1-2 message */}
                        {messages.map((m) => (
                            <MessageBubble key={m.id} msg={m} isMine={m.sender === "me"} avatar={activeContact.avatar} />
                        ))}

                        {/* Buble + grid ảnh giống hình */}
                        <Stack direction="row" spacing={1.5} alignItems="flex-start">
                            <Badge
                                overlap="circular"
                                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                variant="dot"
                                color="success"
                            >
                                <Avatar src={activeContact.avatar} sx={{ width: 36, height: 36 }} />
                            </Badge>
                            <Stack spacing={1}>
                                <Paper
                                    variant="outlined"
                                    sx={{ px: 2, py: 1.25, borderRadius: 3, maxWidth: { xs: "85%", md: "70%" } }}
                                >
                                    <Typography>
                                        Hi Shopia, there’s a problem with the mobile view on the homepage.
                                        Images aren’t scaling right. Can someone check?{" "}
                                        <Typography component="span" color="error.main" fontWeight={600}>#bug</Typography>
                                    </Typography>
                                </Paper>
                                <AttachmentGrid />
                            </Stack>
                            <Box sx={{ flex: 1 }} />
                        </Stack>
                    </Box>

                    {/* Composer */}
                    <Divider />
                    <Box sx={{ p: 1.5 }}>
                        <Paper
                            elevation={0}
                            sx={(t) => ({
                                p: 1,
                                borderRadius: 3,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                bgcolor: t.palette.background.paper,
                                border: `1px solid ${t.palette.divider}`,
                            })}
                        >
                            <IconButton><MicIcon /></IconButton>
                            <TextField
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                placeholder="Type something ..."
                                size="small"
                                fullWidth
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Stack direction="row" spacing={0.5} alignItems="center">
                                                <IconButton onClick={handleSend}><SendIcon /></IconButton>
                                                <IconButton><EmojiIcon /></IconButton>
                                                <IconButton><MoreIcon /></IconButton>
                                            </Stack>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Paper>
                    </Box>
                </Box>
            </Box>
        </MainCard>
    );
}
