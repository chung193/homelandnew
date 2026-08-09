// GroupChatUI.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    AppBar, Avatar, Badge, Box, Button, Chip, Divider, IconButton, InputAdornment,
    List, ListItemButton, ListItemAvatar, ListItemText, Paper, Stack, TextField,
    Toolbar, Tooltip, Typography, Menu, MenuItem
} from "@mui/material";
import {
    Search as SearchIcon,
    Add as AddIcon,
    Send as SendIcon,
    MoreVert as MoreIcon,
    EmojiEmotions as EmojiIcon
} from "@mui/icons-material";
import MainCard from '@components/MainCard';
/* ---------------- Mock data ---------------- */
const users = {
    me: { id: "me", name: "Bro", avatar: "", initials: "ME", online: true },
    u1: { id: "u1", name: "Dawn Teague", avatar: "https://i.pravatar.cc/100?img=65", online: true },
    u2: { id: "u2", name: "David Johnson", avatar: "https://i.pravatar.cc/100?img=12", online: true },
    u3: { id: "u3", name: "Andrew Gilbert", avatar: "https://i.pravatar.cc/100?img=47", online: false },
    u4: { id: "u4", name: "Tyron Derby", avatar: "https://i.pravatar.cc/100?img=23", online: true },
    u5: { id: "u5", name: "Susan Liles", avatar: "", initials: "SL", online: true },
};

const groupsSeed = [
    {
        id: "g1",
        name: "Frontend Team",
        members: ["me", "u1", "u2", "u3"],
        unread: 2,
        last: "Images aren’t scaling right…",
    },
    {
        id: "g2",
        name: "Ops & QA",
        members: ["me", "u2", "u4"],
        unread: 0,
        last: "Deploy HRM v2.3 2PM",
    },
    {
        id: "g3",
        name: "Chill Zone",
        members: ["me", "u1", "u2", "u3", "u4", "u5"],
        unread: 4,
        last: "Coffee chat ☕",
    },
];

const now = Date.now();
const seedMessages = [
    { id: "m1", groupId: "g1", senderId: "u1", text: "Hello team 👋", time: now - 1000 * 60 * 60 * 3 },
    { id: "m2", groupId: "g1", senderId: "me", text: "Ok, mình check mobile layout nhé.", time: now - 1000 * 60 * 60 * 2.5 },
    { id: "m3", groupId: "g1", senderId: "u2", text: "Ảnh trên homepage bị stretching.", time: now - 1000 * 60 * 60 * 2.25 },
    { id: "m4", groupId: "g2", senderId: "u4", text: "Deploy 2PM. Nhớ verify logs.", time: now - 1000 * 60 * 60 },
    { id: "m5", groupId: "g3", senderId: "u5", text: "Cafe chiều nay ai rảnh không?", time: now - 1000 * 60 * 20 },
];

/* ---------------- Helpers ---------------- */
const makeId = () =>
    (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : `id_${Math.random().toString(36).slice(2)}_${Date.now()}`;

const fmt = (ts) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function OnlineDot({ size = 10 }) {
    return (
        <Box sx={{ width: size, height: size, borderRadius: "50%", bgcolor: "success.main", border: "2px solid white" }} />
    );
}

function MemberAvatar({ u, size = 28 }) {
    const hasImg = !!u.avatar;
    return (
        <Badge
            overlap="circular"
            variant="dot"
            color={u.online ? "success" : "default"}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
            <Avatar
                src={hasImg ? u.avatar : undefined}
                sx={{ width: size, height: size, bgcolor: hasImg ? "transparent" : "primary.main" }}
            >
                {!hasImg ? (u.initials || u.name?.[0]) : null}
            </Avatar>
        </Badge>
    );
}

/* group consecutive messages by same sender for spacing/name rules */
function buildView(messages, currentGroupId) {
    const list = messages.filter(m => m.groupId === currentGroupId).sort((a, b) => a.time - b.time);
    const result = [];
    for (let i = 0; i < list.length; i++) {
        const m = list[i];
        const prev = list[i - 1];
        const showName = !prev || prev.senderId !== m.senderId;
        result.push({ ...m, showName });
    }
    return result;
}

/* ---------------- UI Pieces ---------------- */
function MessageBubble({ msg, isMine, user }) {
    return (
        <Stack spacing={0.5} sx={{ maxWidth: { xs: "85%", md: "70%" } }}>
            {/* Name label for others */}
            {!isMine && msg.showName && (
                <Typography variant="caption" color="text.secondary" sx={{ pl: 0.5 }}>
                    {user.name}
                </Typography>
            )}
            <Stack direction="row" spacing={1.25} alignItems="flex-end" justifyContent={isMine ? "flex-end" : "flex-start"}>
                {!isMine && <MemberAvatar u={user} size={32} />}

                <Paper
                    variant="outlined"
                    sx={(t) => ({
                        px: 1.75,
                        py: 1.25,
                        borderRadius: 3,
                        borderTopLeftRadius: isMine ? 3 : 1,
                        borderTopRightRadius: isMine ? 1 : 3,
                        bgcolor: isMine ? (t.palette.mode === "dark" ? "grey.900" : "grey.100") : (t.palette.mode === "dark" ? "grey.800" : "common.white"),
                    })}
                >
                    <Typography sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {msg.text}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{fmt(msg.time)}</Typography>
                </Paper>

                {isMine && <MemberAvatar u={users.me} size={32} />}
            </Stack>
        </Stack>
    );
}

/* Mentions popover */
function MentionsMenu({ anchorEl, onClose, onPick, candidates }) {
    const open = Boolean(anchorEl);
    return (
        <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
            {candidates.map((u) => (
                <MenuItem key={u.id} onClick={() => onPick(u)}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <MemberAvatar u={u} size={22} />
                        <Typography>{u.name}</Typography>
                    </Stack>
                </MenuItem>
            ))}
        </Menu>
    );
}

/* ---------------- Main Component ---------------- */
export default function ChatGroup() {
    const [groups, setGroups] = useState(groupsSeed);
    const [activeGroupId, setActiveGroupId] = useState(groupsSeed[0].id);
    const [messages, setMessages] = useState(seedMessages);
    const [draft, setDraft] = useState("");
    const [search, setSearch] = useState("");
    const [mentionEl, setMentionEl] = useState(null);

    const scrollRef = useRef(null);

    const activeGroup = useMemo(() => groups.find(g => g.id === activeGroupId), [groups, activeGroupId]);
    const groupMembers = useMemo(() => activeGroup.members.map(id => users[id]), [activeGroup]);
    const viewMsgs = useMemo(() => buildView(messages, activeGroupId), [messages, activeGroupId]);

    /* auto scroll */
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }, [viewMsgs.length, activeGroupId]);

    /* fake unread reset */
    useEffect(() => {
        setGroups(prev => prev.map(g => g.id === activeGroupId ? { ...g, unread: 0 } : g));
    }, [activeGroupId]);

    const handleSend = () => {
        const text = draft.trim();
        if (!text) return;
        setMessages(prev => [...prev, { id: makeId(), groupId: activeGroupId, senderId: "me", text, time: Date.now() }]);
        setDraft("");

        // simulate reply from first non-me member
        const other = groupMembers.find(u => u.id !== "me");
        if (other) {
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: makeId(),
                    groupId: activeGroupId,
                    senderId: other.id,
                    text: `@${users.me.name} đã nhận: "${text}"`,
                    time: Date.now() + 1000
                }]);
            }, 1200);
        }
    };

    /* simple @mention trigger */
    const onKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
            return;
        }
        if (e.key === "@") {
            // open menu at cursor (approx using event target)
            setMentionEl(e.currentTarget);
        }
    };

    const insertMention = (u) => {
        const at = draft.endsWith("@") ? draft.slice(0, -1) : draft;
        setDraft(at + "@" + u.name + " ");
        setMentionEl(null);
    };

    const filteredGroups = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return groups;
        return groups.filter(g => g.name.toLowerCase().includes(q));
    }, [groups, search]);

    return (
        <MainCard>
            <Box sx={{ height: "100vh", display: "grid", gridTemplateColumns: { xs: "1fr", md: "360px 1fr" }, bgcolor: (t) => (t.palette.mode === "dark" ? "background.default" : "grey.50") }}>
                {/* Left: groups list */}
                <Box sx={{ borderRight: (t) => `1px solid ${t.palette.divider}`, display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <Box sx={{ p: 2 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search groups…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button fullWidth variant="contained" startIcon={<AddIcon />} sx={{ mt: 2, borderRadius: 2 }}>
                            New Group
                        </Button>
                    </Box>
                    <Divider />
                    <Box sx={{ flex: 1, overflow: "auto" }}>
                        <List dense>
                            {filteredGroups.map((g) => {
                                const memberAvts = g.members.slice(0, 3).map(id => users[id]);
                                const more = Math.max(0, g.members.length - 3);
                                return (
                                    <ListItemButton
                                        key={g.id}
                                        selected={activeGroupId === g.id}
                                        onClick={() => setActiveGroupId(g.id)}
                                        sx={{ mx: 1, my: 0.5, borderRadius: 2 }}
                                    >
                                        <ListItemAvatar>
                                            <Stack direction="row" spacing={-0.75}>
                                                {memberAvts.map((u) => (
                                                    <Avatar key={u.id} src={u.avatar} sx={{ width: 28, height: 28, border: "2px solid white" }}>
                                                        {!u.avatar ? (u.initials || u.name[0]) : null}
                                                    </Avatar>
                                                ))}
                                                {more > 0 && (
                                                    <Avatar sx={{ width: 28, height: 28, bgcolor: "grey.300", color: "text.primary", fontSize: 12 }}>
                                                        +{more}
                                                    </Avatar>
                                                )}
                                            </Stack>
                                        </ListItemAvatar>

                                        <ListItemText
                                            primary={
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Typography component="span" fontWeight={700} noWrap sx={{ maxWidth: 180 }}>
                                                        {g.name}
                                                    </Typography>
                                                    {g.unread ? <Chip size="small" label={g.unread} color="error" /> : null}
                                                </Stack>
                                            }
                                            secondary={
                                                <Typography component="span" variant="body2" color="text.secondary" noWrap>
                                                    {g.last}
                                                </Typography>
                                            }
                                            primaryTypographyProps={{ component: "div" }}
                                            secondaryTypographyProps={{ component: "div" }}
                                        />
                                    </ListItemButton>
                                );
                            })}
                        </List>
                    </Box>
                </Box>

                {/* Right: chat panel */}
                <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    {/* Header */}
                    <AppBar position="static" elevation={0} color="default" sx={{ borderBottom: (t) => `1px solid ${t.palette.divider}` }}>
                        <Toolbar sx={{ gap: 2 }}>
                            {/* stacked member avatars */}
                            <Stack direction="row" spacing={-0.75} alignItems="center">
                                {groupMembers.slice(0, 4).map((u) => (
                                    <MemberAvatar key={u.id} u={u} />
                                ))}
                                {groupMembers.length > 4 && (
                                    <Avatar sx={{ width: 28, height: 28, bgcolor: "grey.300", color: "text.primary", fontSize: 12 }}>
                                        +{groupMembers.length - 4}
                                    </Avatar>
                                )}
                            </Stack>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="subtitle1" fontWeight={700} noWrap>{activeGroup.name}</Typography>
                                <Typography variant="caption" color="text.secondary" noWrap>
                                    {groupMembers.filter(u => u.online).length} online • {groupMembers.length} members
                                </Typography>
                            </Box>
                            <Tooltip title="Group options"><IconButton><MoreIcon /></IconButton></Tooltip>
                        </Toolbar>
                    </AppBar>

                    {/* Messages */}
                    <Box ref={scrollRef} sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
                        {viewMsgs.map((m) => {
                            const isMine = m.senderId === "me";
                            const u = users[m.senderId];
                            return (
                                <MessageBubble key={m.id} msg={m} isMine={isMine} user={u} />
                            );
                        })}

                        {/* Typing indicator demo */}
                        <Stack direction="row" spacing={1} alignItems="center">
                            <MemberAvatar u={users.u1} size={28} />
                            <Paper variant="outlined" sx={{ px: 1.25, py: 0.75, borderRadius: 2 }}>
                                <Stack direction="row" spacing={0.5}>
                                    <Dot />
                                    <Dot delay={150} />
                                    <Dot delay={300} />
                                </Stack>
                            </Paper>
                        </Stack>
                    </Box>

                    {/* Composer */}
                    <Divider />
                    <Box sx={{ p: 1.25 }}>
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
                            <TextField
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                placeholder="Message #group — dùng @ để nhắc thành viên"
                                size="small"
                                fullWidth
                                onKeyDown={onKeyDown}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmojiIcon />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Stack direction="row" spacing={0.5} alignItems="center">
                                                <Button variant="contained" endIcon={<SendIcon />} onClick={handleSend} sx={{ borderRadius: 2 }}>
                                                    Send
                                                </Button>
                                            </Stack>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Paper>
                    </Box>
                </Box>

                {/* Mentions */}
                <MentionsMenu
                    anchorEl={mentionEl}
                    onClose={() => setMentionEl(null)}
                    onPick={insertMention}
                    candidates={groupMembers}
                />
            </Box>
        </MainCard>
    );

    /* small inner pieces */
    // function onKeyDown(e) {
    //     if (e.key === "Enter" && !e.shiftKey) {
    //         e.preventDefault();
    //         handleSend();
    //         return;
    //     }
    //     if (e.key === "@") {
    //         setMentionEl(e.currentTarget);
    //     }
    // }
}

/* typing dots */
function Dot({ delay = 0 }) {
    return (
        <Box
            sx={{
                width: 6, height: 6, borderRadius: "50%",
                bgcolor: "text.secondary", opacity: 0.3,
                animation: "blink 1s infinite",
                animationDelay: `${delay}ms`,
                "@keyframes blink": {
                    "0%, 100%": { opacity: 0.3 },
                    "50%": { opacity: 1 },
                },
            }}
        />
    );
}
