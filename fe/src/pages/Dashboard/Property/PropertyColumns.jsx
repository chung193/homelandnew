import { Chip } from '@mui/material';

const getColumns = (t) => [
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
        width: 220,
        editable: true,
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
        valueFormatter: (value) => (value ? `${Number(value).toLocaleString('vi-VN')} đ` : '-'),
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
        renderCell: (params) => <Chip label={params.value || 'draft'} size="small" variant="outlined" />,
    },
    {
        field: 'is_active',
        headerName: t('pages.property.table.isActive'),
        width: 120,
        editable: true,
        renderCell: (params) => <Chip label={params.value ? 'Hiển thị' : 'Ẩn'} color={params.value ? 'success' : 'default'} size="small" />,
    },
];

export default getColumns;
