import { Button, Chip, Stack } from '@mui/material';
import { formatToCurrency } from '../../../utils/common';

const statusLabels = { pending: 'Chờ duyệt', published: 'Đã duyệt', archived: 'Từ chối/Lưu trữ', draft: 'Bản nháp', sold: 'Đã bán', rented: 'Đã thuê' };
const statusColors = { pending: 'warning', published: 'success', archived: 'error', draft: 'default', sold: 'info', rented: 'info' };

const getColumns = (t, onApprove, onReject, onView) => [
    {
        field: 'stt',
        headerName: t('pages.property.table.stt'),
        width: 70,
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
        field: 'title',
        headerName: t('pages.property.table.title'),
        width: 260,
        editable: false,
        renderCell: (params) => (
            <Button
                variant="text"
                color="primary"
                onClick={() => onView(params.row)}
                sx={{ justifyContent: 'flex-start', px: 0, textAlign: 'left', textTransform: 'none', whiteSpace: 'normal' }}
            >
                {params.value}
            </Button>
        ),
    },
    {
        field: 'property_type',
        headerName: t('pages.property.table.propertyType'),
        width: 170,
        editable: false,
        renderCell: (params) => params.value?.name || '_',
    },
    {
        field: 'listing_type',
        headerName: t('pages.property.table.listingType'),
        width: 120,
        editable: true,
        renderCell: (params) => (
            <Chip label={params.value === 'rent' ? 'Thuê' : 'Bán'} size="small" color="primary" variant="outlined" />
        ),
    },
    {
        field: 'price',
        headerName: t('pages.property.table.price'),
        width: 140,
        editable: true,
        valueFormatter: (value) => (value ? formatToCurrency(value) : '-'),
    },
    {
        field: 'area',
        headerName: t('pages.property.table.area'),
        width: 110,
        editable: true,
        valueFormatter: (value) => (value ? `${value} m²` : '-'),
    },
    {
        field: 'status',
        headerName: t('pages.property.table.status'),
        width: 140,
        editable: true,
        renderCell: (params) => <Chip label={statusLabels[params.value] || params.value || 'Bản nháp'} color={statusColors[params.value] || 'default'} size="small" variant="outlined" />,
    },
    {
        field: 'is_active',
        headerName: t('pages.property.table.isActive'),
        width: 120,
        editable: true,
        renderCell: (params) => <Chip label={params.value ? 'Hiển thị' : 'Ẩn'} color={params.value ? 'success' : 'default'} size="small" />,
    },
    {
        field: 'actions', headerName: 'Thao tác', width: 280, sortable: false, filterable: false,
        renderCell: (params) => <Stack direction="row" spacing={1}>
            <Button size="small" variant="text" onClick={() => onView(params.row)}>Chi tiết</Button>
            {params.row.status === 'pending' ? <>
            <Button size="small" variant="contained" color="success" onClick={() => onApprove(params.row)}>Duyệt</Button>
            <Button size="small" variant="outlined" color="error" onClick={() => onReject(params.row)}>Từ chối</Button>
            </> : null}
        </Stack>,
    },
];

export default getColumns;
