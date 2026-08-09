import { Chip } from '@mui/material';

const getColumns = (t) => [
    {
        field: 'stt',
        headerName: t('pages.propertyType.table.stt'),
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
        field: 'name',
        headerName: t('pages.propertyType.table.name'),
        width: 220,
        editable: true,
    },
    {
        field: 'slug',
        headerName: t('pages.propertyType.table.slug'),
        width: 180,
        editable: true,
    },
    {
        field: 'sort_order',
        headerName: t('pages.propertyType.table.sortOrder'),
        width: 120,
        editable: true,
    },
    {
        field: 'is_active',
        headerName: t('pages.propertyType.table.isActive'),
        width: 120,
        editable: true,
        renderCell: (params) => <Chip label={params.value ? 'Hiển thị' : 'Ẩn'} color={params.value ? 'success' : 'default'} size="small" />,
    },
];

export default getColumns;
