import { Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { CheckCircleOutline, DeleteOutline } from '@mui/icons-material';

const formatDate = (value) => {
    if (!value) return '_';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString('vi-VN');
};

const getColumns = (t, { onApprove = () => { }, onDelete = () => { }, approvingId = null, deletingId = null } = {}) => [
    {
        field: 'stt',
        headerName: t('pages.comment.table.stt'),
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
        field: 'author_name',
        headerName: t('pages.comment.table.author'),
        minWidth: 180,
        flex: 0.7,
        renderCell: ({ row }) => (
            <Stack spacing={0.25} sx={{ py: 1 }}>
                <Typography variant="body2" fontWeight={600}>{row.author_name || 'Anonymous'}</Typography>
                <Typography variant="caption" color="text.secondary">{row.author_email || '_'}</Typography>
            </Stack>
        ),
    },
    {
        field: 'post',
        headerName: t('pages.comment.table.post'),
        minWidth: 180,
        flex: 0.8,
        renderCell: ({ value }) => value?.name || '_',
    },
    {
        field: 'body',
        headerName: t('pages.comment.table.body'),
        minWidth: 280,
        flex: 1.4,
        renderCell: ({ row }) => (
            <Stack spacing={0.5} sx={{ py: 1 }}>
                <Typography variant="body2">{row.body}</Typography>
                {row.parent_body && (
                    <Typography variant="caption" color="text.secondary">
                        Reply to: {row.parent_body}
                    </Typography>
                )}
            </Stack>
        ),
    },
    {
        field: 'is_approved',
        headerName: t('pages.comment.table.status'),
        width: 140,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ value }) => (
            <Chip
                size="small"
                label={value ? t('pages.comment.status.approved') : t('pages.comment.status.pending')}
                color={value ? 'success' : 'warning'}
                variant="outlined"
            />
        ),
    },
    {
        field: 'created_at',
        headerName: t('pages.comment.table.createdAt'),
        minWidth: 180,
        flex: 0.7,
        renderCell: ({ value }) => formatDate(value),
    },
    {
        field: 'actions',
        headerName: t('pages.comment.table.actions'),
        width: 120,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
            <Stack direction="row" spacing={0.5}>
                <Tooltip title={t('pages.comment.actions.approve')}>
                    <span>
                        <IconButton
                            size="small"
                            color="success"
                            disabled={row.is_approved || approvingId === row.id}
                            onClick={() => onApprove(row)}
                        >
                            <CheckCircleOutline fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
                <Tooltip title={t('pages.comment.actions.delete')}>
                    <span>
                        <IconButton
                            size="small"
                            color="error"
                            disabled={deletingId === row.id}
                            onClick={() => onDelete(row)}
                        >
                            <DeleteOutline fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
            </Stack>
        ),
    },
];

export default getColumns;

