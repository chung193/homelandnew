// VideoCallUI.jsx
import React, { useState } from "react";
import {
    AppBar, Toolbar, Typography, Box, Paper, Stack, Avatar, IconButton, Button,
    Divider, List, ListItem, ListItemAvatar, ListItemText
} from "@mui/material";
import {
    Mic as MicIcon,
    Videocam as CameraIcon,
    ScreenShare as ScreenShareIcon,
    EmojiEmotions as EmojiIcon,
    CallEnd as CallEndIcon,
    PushPin as PinIcon,
} from "@mui/icons-material";
import MainCard from "@components/MainCard";
const participants = [
    { id: 1, name: "You", img: "https://i.pravatar.cc/100?img=1" },
    { id: 2, name: "Michaela Sutton", img: "https://i.pravatar.cc/100?img=2" },
    { id: 3, name: "James Davis", img: "https://i.pravatar.cc/100?img=3" },
    { id: 4, name: "Wendy Dugan", img: "https://i.pravatar.cc/100?img=4" },
    { id: 5, name: "John Powers", img: "https://i.pravatar.cc/100?img=5" },
];

const keyMoments = [
    { time: "00:01:48", label: "Weekly Update" },
    { time: "00:02:48", label: "Design Issue" },
    { time: "00:03:01", label: "Deadline Discusses" },
    { time: "00:00:41", label: "Current", highlight: true },
];

const groupChat = [
    { id: 1, name: "Michaela Sutton", text: "I think this SRBThemes will provide us with some great insights.", time: "02:14", img: "https://i.pravatar.cc/100?img=2" },
    { id: 2, name: "John Powers", text: "How about our problem last week?", time: "03:47", img: "https://i.pravatar.cc/100?img=5" },
    { id: 3, name: "James Davis", text: "We all done, no worries 😎", time: "04:10", img: "https://i.pravatar.cc/100?img=3" },
];

export default function VideoCall() {
    const [mainUser] = useState(participants[4]);

    return (
        <MainCard>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "3fr 1fr" }, height: "100vh" }}>
                {/* Left side: videos */}
                <Stack sx={{ p: 2, gap: 2 }}>
                    {/* top row 4 users */}
                    <Stack direction="row" spacing={2} justifyContent="space-between">
                        {participants.slice(0, 4).map((p) => (
                            <Paper key={p.id} sx={{ flex: 1, position: "relative", borderRadius: 2, overflow: "hidden" }}>
                                <Box component="img" src={p.img} alt={p.name} sx={{ width: "100%", height: 150, objectFit: "cover" }} />
                                <Typography
                                    variant="body2"
                                    sx={{ position: "absolute", bottom: 8, left: 8, bgcolor: "rgba(0,0,0,0.5)", color: "#fff", px: 1, borderRadius: 1 }}
                                >
                                    {p.name}
                                </Typography>
                                <MicIcon sx={{ position: "absolute", top: 8, left: 8, color: "#fff" }} />
                            </Paper>
                        ))}
                    </Stack>

                    {/* main speaker */}
                    <Paper sx={{ flex: 1, position: "relative", borderRadius: 2, overflow: "hidden" }}>
                        <Box component="img" src={mainUser.img} alt={mainUser.name} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <Typography
                            variant="body2"
                            sx={{ position: "absolute", bottom: 8, left: 8, bgcolor: "rgba(0,0,0,0.5)", color: "#fff", px: 1, borderRadius: 1 }}
                        >
                            Hello, Shopia Mia
                        </Typography>
                        <MicIcon sx={{ position: "absolute", top: 8, left: 8, color: "#fff" }} />
                    </Paper>

                    {/* controls */}
                    <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                        <MicIcon fontSize="large" />
                        <CameraIcon fontSize="large" />
                        <ScreenShareIcon fontSize="large" />
                        <EmojiIcon fontSize="large" />
                        <Button variant="contained" color="error" startIcon={<CallEndIcon />}>
                            Leave Call
                        </Button>
                    </Stack>
                </Stack>

                {/* Right side: key moments + chat */}
                <Stack sx={{ borderLeft: (t) => `1px solid ${t.palette.divider}`, p: 2, gap: 2, overflow: "auto" }}>
                    <Box>
                        <Typography variant="subtitle1" fontWeight={700}>Key Moments</Typography>
                        <Stack spacing={1} mt={1}>
                            {keyMoments.map((km, i) => (
                                <Paper key={i} variant="outlined" sx={{ p: 1, display: "flex", alignItems: "center", gap: 1, borderColor: km.highlight ? "success.main" : undefined }}>
                                    <Typography sx={{ color: km.highlight ? "success.main" : undefined, fontWeight: km.highlight ? 700 : 400 }}>
                                        {km.time}
                                    </Typography>
                                    <Typography variant="body2" sx={{ flex: 1 }}>{km.label}</Typography>
                                    {km.highlight && <PinIcon color="error" fontSize="small" />}
                                </Paper>
                            ))}
                        </Stack>
                    </Box>

                    <Divider />

                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={700}>Group Chat</Typography>
                        <List dense>
                            {groupChat.map((m) => (
                                <ListItem key={m.id} alignItems="flex-start">
                                    <ListItemAvatar>
                                        <Avatar src={m.img} />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography fontWeight={600}>{m.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{m.time}</Typography>
                                            </Stack>
                                        }
                                        secondary={<Typography variant="body2">{m.text}</Typography>}
                                        primaryTypographyProps={{ component: "div" }}
                                        secondaryTypographyProps={{ component: "div" }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Stack>
            </Box>
        </MainCard>
    );
}
