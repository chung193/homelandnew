import { Avatar, Chip, Stack, Typography } from "@mui/material";

const formatBytes = (bytes = 0) => {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    let value = bytes;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
    }
    return `${value.toFixed(1)} ${units[unitIndex]}`;
};

const getColumns = (t) => [
    {
        field: "stt",
        headerName: t("pages.media.table.stt"),
        width: 80,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
            const paginationModel = params.api.state.pagination?.paginationModel;
            const page = paginationModel?.page ?? 0;
            const pageSize = paginationModel?.pageSize ?? 0;
            const indexInPage = params.api.getRowIndexRelativeToVisibleRows(params.id) + 1;
            return page * pageSize + indexInPage;
        },
    },
    {
        field: "preview",
        headerName: "Preview",
        width: 120,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
            <Avatar
                variant="rounded"
                src={params.row.thumb || params.row.url}
                alt={params.row.name || params.row.file_name}
                sx={{ width: 64, height: 40 }}
            />
        ),
    },
    {
        field: "name",
        headerName: t("pages.media.table.name"),
        width: 220,
    },
    {
        field: "file_name",
        headerName: "File",
        width: 240,
        renderCell: (params) => (
            <Stack>
                <Typography variant="body2" noWrap>
                    {params.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                    {params.row.collection_name}
                </Typography>
            </Stack>
        ),
    },
    {
        field: "mime_type",
        headerName: "Mime",
        width: 150,
        renderCell: (params) => (
            <Chip label={params.value} color="secondary" variant="outlined" size="small" />
        ),
    },
    {
        field: "size",
        headerName: "Size",
        width: 110,
        renderCell: (params) => formatBytes(Number(params.value || 0)),
    },
    {
        field: "created_at",
        headerName: t("pages.media.table.createdAt"),
        width: 200,
        renderCell: (params) => new Date(params.value).toLocaleString(),
    },
];

export default getColumns;
