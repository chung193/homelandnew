import { Chip, Avatar, Box, Stack, Typography } from "@mui/material";
import { getMediaUrl } from '@utils/mediaUrl';

const getSourceLabel = (value) => {
    if (value === 'self_registered') {
        return 'Tự đăng ký';
    }

    if (value === 'admin_created') {
        return 'Nội bộ';
    }

    return value || 'Không rõ';
};

const getColumns = (t) => [
    {
        field: 'stt',
        headerName: t('pages.user.table.stt'),
        width: 50,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
            const paginationModel =
                params.api.state.pagination?.paginationModel;

            const page = paginationModel?.page ?? 0;
            const pageSize = paginationModel?.pageSize ?? 0;

            const indexInPage =
                params.api.getRowIndexRelativeToVisibleRows(params.id) + 1;

            return page * pageSize + indexInPage;
        },
    },
    {
        field: 'name',
        headerName: t('pages.user.table.name'),
        width: 200,
        editable: true,
        renderCell: (params) => {
            return (
                <Box sx={{ p: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                            alt={params.value}
                            src={getMediaUrl(params.row.avatar)}
                            sx={{ width: 60, height: 60, mr: '15px' }}
                        />

                        <Typography>
                            <a href={`user?id=${params.row.id}`}>
                                <strong>{params.value}</strong>
                            </a>
                        </Typography>
                    </Stack>
                </Box>
            )
        }
    },
    {
        field: 'email',
        headerName: t('pages.user.table.email'),
        width: 250,
        align: 'center',
        editable: true,
        renderCell: (params) => {
            return params.value
        }
    },
    {
        field: 'is_active',
        headerName: t('pages.user.table.status'),
        width: 150,
        editable: true,
        renderCell: (params) => {
            if (!params.value) {
                return <Chip label="Người dùng đang tạm khóa" color="secondary" size="small" />
            }

            return <Chip label="Hoạt động" color="success" size="small" />
        }
    },
    {
        field: 'is_verified',
        headerName: 'Xác thực email',
        width: 150,
        editable: false,
        renderCell: (params) => (
            <Chip
                label={params.value ? 'Đã xác thực' : 'Chưa xác thực'}
                color={params.value ? 'success' : 'warning'}
                size="small"
                variant={params.value ? 'filled' : 'outlined'}
            />
        )
    },
    {
        field: 'registration_source',
        headerName: 'Nguồn tạo',
        width: 140,
        editable: false,
        renderCell: (params) => (
            <Chip
                label={getSourceLabel(params.value)}
                color={params.value === 'self_registered' ? 'info' : 'default'}
                size="small"
                variant="outlined"
            />
        )
    },
    {
        field: 'roles',
        headerName: t('pages.user.table.role'),
        width: 220,
        editable: false,
        renderCell: (params) => {
            const roles = Array.isArray(params.value) ? params.value : [];

            if (roles.length === 0) {
                return 'Chưa set';
            }

            return (
                <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap" sx={{ py: 1 }}>
                    {roles.map((role) => (
                        <Chip key={role.id || role.name} label={role.name} size="small" color="primary" variant="outlined" />
                    ))}
                </Stack>
            );
        }
    },

    {
        field: 'created_at',
        headerName: t('pages.user.table.createdAt'),
        width: 200,
        editable: false,
        renderCell: (params) => new Date(params.value).toLocaleString(),
    },
    {
        field: 'updated_at',
        headerName: t('pages.user.table.updatedAt'),
        width: 200,
        editable: false,
        renderCell: (params) => new Date(params.value).toLocaleString(),
    },
];

export default getColumns;
