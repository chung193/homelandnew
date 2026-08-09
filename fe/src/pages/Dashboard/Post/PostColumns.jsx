import { Avatar, Box, Button, Chip, Stack, Typography } from '@mui/material';

const getColumns = (t, { onOpenComments = () => {} } = {}) => [
    {
        field: 'stt',
        headerName: t('pages.post.table.stt'),
        width: 60,
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
        field: 'name',
        headerName: t('pages.post.table.name'),
        width: 400,
        editable: true,
        renderCell: (params) => (
            <Box sx={{ p: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                        alt={params.value}
                        src={params.row.avatar}
                        sx={{ width: 60, height: 60, mr: '15px' }}
                    />

                    <Typography>
                        <a href={`/dashboard/post?id=${params.row.id}`}>
                            <strong>{params.value}</strong>
                        </a>
                    </Typography>
                </Stack>
            </Box>
        ),
    },
    {
        field: 'comments_count',
        headerName: 'Bình luận',
        width: 130,
        editable: false,
        sortable: false,
        renderCell: (params) => (
            <Button size="small" onClick={() => onOpenComments(params.row)}>
                {params.value || 0}
            </Button>
        ),
    },
    {
        field: 'slug',
        headerName: t('pages.post.table.slug'),
        width: 300,
        editable: true,
    },
    {
        field: 'description',
        headerName: t('pages.post.table.description'),
        width: 500,
        editable: true,
    },
    {
        field: 'user',
        headerName: t('pages.post.table.user'),
        width: 200,
        editable: false,
        renderCell: (params) => <Chip label={params.value?.name} size="small" />,
    },
    {
        field: 'category',
        headerName: t('pages.post.table.category'),
        width: 200,
        editable: false,
        renderCell: (params) => <Chip label={params.value?.name} size="small" />,
    },
    {
        field: 'tags',
        headerName: t('pages.post.table.tags'),
        width: 280,
        editable: false,
        renderCell: (params) => {
            const items = Array.isArray(params.value) ? params.value : [];
            if (items.length === 0) return '_';

            return (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, py: 0.5 }}>
                    {items.slice(0, 3).map((tag) => (
                        <Chip key={tag.id || tag.slug || tag.name} label={tag.name} size="small" />
                    ))}
                    {items.length > 3 && <Chip label={`+${items.length - 3}`} size="small" variant="outlined" />}
                </Box>
            );
        },
    },
    {
        field: 'type',
        headerName: t('pages.post.table.type'),
        width: 100,
        editable: true,
        renderCell: (params) => <Chip label={params.value} size="small" color="error" />,
    },
    {
        field: 'status',
        headerName: t('pages.post.table.status'),
        width: 100,
        editable: true,
        renderCell: (params) => <Chip label={params.value} size="small" color="info" />,
    },
    {
        field: 'created_at',
        headerName: t('pages.post.table.createdAt'),
        width: 180,
        editable: false,
        renderCell: (params) => new Date(params.value).toLocaleString(),
    },
    {
        field: 'updated_at',
        headerName: t('pages.post.table.updatedAt'),
        width: 180,
        editable: false,
        renderCell: (params) => new Date(params.value).toLocaleString(),
    },
];

export default getColumns;
