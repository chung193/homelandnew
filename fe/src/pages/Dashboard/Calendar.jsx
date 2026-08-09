// CalendarScreenBig.jsx
import React, { useMemo, useState, useCallback } from "react";
import {
    AppBar, Toolbar, Typography, Box, Paper, Stack, Divider, IconButton,
    List, ListItemButton, ListItemText, Chip, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Avatar, Tooltip
} from "@mui/material";
import {
    Event as EventIcon,
    Today as TodayIcon,
    Add as AddIcon,
    Close as CloseIcon
} from "@mui/icons-material";

import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import MainCard from "@components/MainCard";

dayjs.extend(isBetween);

// Localizer cho Big Calendar dùng dayjs
const localizer = dayjsLocalizer(dayjs);

// Mock data ban đầu
const seedEvents = [
    {
        id: "e1",
        title: "Standup Team IT",
        start: dayjs().hour(9).minute(0).toDate(),
        end: dayjs().hour(9).minute(30).toDate(),
        location: "Room 401",
        desc: "Daily standup 30 phút.",
        color: "primary",
        attendees: ["Ray", "Bro"],
    },
    {
        id: "e2",
        title: "Deploy HRM v2.3",
        start: dayjs().hour(14).minute(0).toDate(),
        end: dayjs().hour(15).minute(0).toDate(),
        location: "Zoom",
        desc: "Triển khai + verify logs.",
        color: "success",
        attendees: ["Ops", "QA", "Bro"],
    },
    {
        id: "e3",
        title: "Coffee chat ☕",
        start: dayjs().add(1, "day").hour(10).minute(0).toDate(),
        end: dayjs().add(1, "day").hour(10).minute(45).toDate(),
        location: "Sân thượng",
        desc: "Relax xíu cho đời nở hoa.",
        color: "warning",
        attendees: ["Bro"],
    },
];

const fmt = (d) => dayjs(d).format("HH:mm");
const sameDay = (a, b) => dayjs(a).isSame(b, "day");

// Style event theo màu (gần giống palette MUI)
const eventStyleGetter = (event /*, start, end, isSelected*/) => {
    const map = {
        primary: "#1976d2",
        success: "#2e7d32",
        warning: "#ed6c02",
        info: "#0288d1",
        error: "#d32f2f",
    };
    const bg = map[event.color] || map.info;
    return {
        style: {
            backgroundColor: bg,
            borderRadius: 8,
            border: "none",
            color: "#fff",
            padding: "2px 6px",
        },
    };
};

export default function CalendarScreenBig() {
    const [events, setEvents] = useState(seedEvents);
    const [viewDate, setViewDate] = useState(new Date());
    const [view, setView] = useState("month"); // control view -> nút Tháng/Tuần/Ngày hoạt động
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [openAdd, setOpenAdd] = useState(false);

    const dayEvents = useMemo(
        () =>
            events
                .filter((e) => sameDay(e.start, selectedDate))
                .sort((a, b) => a.start - b.start),
        [events, selectedDate]
    );

    // Chọn slot trống -> mở dialog thêm
    const onSelectSlot = useCallback((slotInfo) => {
        setSelectedDate(dayjs(slotInfo.start));
        setOpenAdd(true);
    }, []);

    // Click event -> xem chi tiết
    const onSelectEvent = useCallback((event) => {
        setSelectedEvent(event);
        setSelectedDate(dayjs(event.start));
    }, []);

    const onNavigateToday = () => {
        const today = dayjs();
        setViewDate(today.toDate());
        setSelectedDate(today);
    };

    const handleAdd = (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const title = data.get("title")?.toString().trim();
        const dateStr = selectedDate.format("YYYY-MM-DD");
        const start = dayjs(`${dateStr} ${data.get("start") || "09:00"}`).toDate();
        const end = dayjs(`${dateStr} ${data.get("end") || "10:00"}`).toDate();
        const location = data.get("location")?.toString();
        const desc = data.get("desc")?.toString();
        const color = data.get("color")?.toString() || "info";

        if (!title) return;

        setEvents((prev) => [
            ...prev,
            {
                id: crypto?.randomUUID?.() ?? `e_${Date.now()}`,
                title,
                start,
                end,
                location,
                desc,
                color,
                attendees: ["Bro"],
            },
        ]);
        setOpenAdd(false);
    };

    return (
        <MainCard>
            {/* Header */}
            <AppBar position="static" elevation={0} color="default">
                <Toolbar sx={{ gap: 1 }}>
                    <EventIcon />
                    <Typography variant="h6" sx={{ flex: 1, fontWeight: 800 }}>
                        Lịch làm việc (React Big Calendar)
                    </Typography>
                    <Tooltip title="Hôm nay">
                        <IconButton onClick={onNavigateToday}>
                            <TodayIcon />
                        </IconButton>
                    </Tooltip>
                    <Button startIcon={<AddIcon />} variant="contained" onClick={() => setOpenAdd(true)}>
                        Thêm sự kiện
                    </Button>
                </Toolbar>
                <Divider />
            </AppBar>

            {/* Content */}
            <Box sx={{ p: 2, flex: 1, display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "1.6fr 1fr" }, minHeight: 0 }}>
                {/* Lịch lớn */}
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 3, minWidth: 0 }}>
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: "calc(100vh - 170px)" }}
                        views={["month", "week", "day", "agenda"]}
                        defaultView="month"
                        date={viewDate}
                        onNavigate={(d) => setViewDate(d)}
                        view={view}
                        onView={setView}
                        selectable
                        onSelectSlot={onSelectSlot}
                        onSelectEvent={onSelectEvent}
                        popup
                        eventPropGetter={eventStyleGetter}
                        dayPropGetter={(date) => ({
                            onClick: () => setSelectedDate(dayjs(date)),
                        })}
                        messages={{
                            month: "Tháng",
                            week: "Tuần",
                            day: "Ngày",
                            agenda: "Agenda",
                            today: "Hôm nay",
                            previous: "Trước",
                            next: "Sau",
                            showMore: (total) => `+${total} sự kiện`,
                        }}
                        formats={{
                            timeGutterFormat: (date) => dayjs(date).format("HH:mm"),
                            eventTimeRangeFormat: ({ start, end }) => `${fmt(start)}–${fmt(end)}`,
                            agendaTimeRangeFormat: ({ start, end }) => `${fmt(start)}–${fmt(end)}`,
                        }}
                    />
                </Paper>

                {/* Danh sách & chi tiết */}
                <Stack spacing={2} sx={{ minHeight: 0 }}>
                    {/* Danh sách sự kiện theo ngày chọn */}
                    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 260 }}>
                        <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight={800}>
                                Sự kiện ngày {selectedDate.format("DD/MM/YYYY")}
                            </Typography>
                            <Chip size="small" label={dayEvents.length} />
                        </Box>
                        <Divider />
                        <Box sx={{ flex: 1, overflow: "auto" }}>
                            {dayEvents.length === 0 ? (
                                <Box sx={{ p: 2, color: "text.secondary" }}>Không có sự kiện.</Box>
                            ) : (
                                <List dense>
                                    {dayEvents.map((ev) => (
                                        <ListItemButton key={ev.id} onClick={() => setSelectedEvent(ev)}>
                                            <ListItemText
                                                primary={
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <Chip
                                                            size="small"
                                                            label={`${fmt(ev.start)}–${fmt(ev.end)}`}
                                                            color={ev.color}
                                                            variant="outlined"
                                                        />
                                                        <Typography component="span" fontWeight={700}>
                                                            {ev.title}
                                                        </Typography>
                                                    </Stack>
                                                }
                                                secondary={
                                                    <>
                                                        <Typography component="span" variant="body2" color="text.secondary" display="block">
                                                            {ev.location || "—"}
                                                        </Typography>
                                                        {ev.desc && (
                                                            <Typography component="span" variant="caption" color="text.secondary" display="block">
                                                                {ev.desc}
                                                            </Typography>
                                                        )}
                                                    </>
                                                }
                                                // FIX p lồng p: bọc ngoài của ListItemText là div, không phải p
                                                primaryTypographyProps={{ component: "div" }}
                                                secondaryTypographyProps={{ component: "div" }}
                                            />
                                        </ListItemButton>
                                    ))}
                                </List>
                            )}
                        </Box>
                    </Paper>

                    {/* Chi tiết sự kiện */}
                    <Paper variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
                        <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                            Chi tiết sự kiện
                        </Typography>
                        {!selectedEvent ? (
                            <Typography color="text.secondary">Chọn 1 sự kiện để xem chi tiết.</Typography>
                        ) : (
                            <Stack spacing={1.25}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Chip
                                        size="small"
                                        color={selectedEvent.color}
                                        label={`${fmt(selectedEvent.start)}–${fmt(selectedEvent.end)}`}
                                    />
                                    <Typography variant="h6" fontWeight={800}>{selectedEvent.title}</Typography>
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                    Ngày: {dayjs(selectedEvent.start).format("DD/MM/YYYY")}
                                </Typography>
                                <Typography variant="body2">Địa điểm: {selectedEvent.location || "—"}</Typography>
                                <Typography variant="body2">Mô tả: {selectedEvent.desc || "—"}</Typography>

                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="body2">Người tham dự:</Typography>
                                    <Stack direction="row" spacing={0.5}>
                                        {selectedEvent.attendees?.map((name) => (
                                            <Avatar key={name} sx={{ width: 28, height: 28 }}>
                                                {name[0]?.toUpperCase()}
                                            </Avatar>
                                        ))}
                                    </Stack>
                                </Stack>

                                <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                                    <Button variant="outlined" onClick={() => setSelectedEvent(null)}>Đóng</Button>
                                    <Button variant="contained" color="primary">Sửa (demo)</Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => {
                                            setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
                                            setSelectedEvent(null);
                                        }}
                                    >
                                        Xoá
                                    </Button>
                                </Stack>
                            </Stack>
                        )}
                    </Paper>
                </Stack>
            </Box>

            {/* Dialog thêm sự kiện */}
            <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth component="form" onSubmit={handleAdd}>
                <DialogTitle>Thêm sự kiện ({selectedDate.format("DD/MM/YYYY")})</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField autoFocus label="Tiêu đề" name="title" fullWidth required />
                        <Stack direction="row" spacing={2}>
                            <TextField type="time" label="Bắt đầu" name="start" defaultValue="09:00" fullWidth />
                            <TextField type="time" label="Kết thúc" name="end" defaultValue="10:00" fullWidth />
                        </Stack>
                        <TextField label="Địa điểm" name="location" fullWidth />
                        <TextField label="Mô tả" name="desc" fullWidth multiline minRows={3} />
                        <TextField label="Màu (primary/success/warning/info/error)" name="color" fullWidth defaultValue="info" />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button startIcon={<CloseIcon />} onClick={() => setOpenAdd(false)}>Huỷ</Button>
                    <Button startIcon={<AddIcon />} type="submit" variant="contained">Thêm</Button>
                </DialogActions>
            </Dialog>
        </MainCard>
    );
}
