import { Chip } from "@mui/material";

const getColumns = (t) => [
    {
        field: 'stt',
        headerName: t('pages.category.table.stt'),
        width: 80,
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
        headerName: t('pages.category.table.name'),
        width: 150,
        editable: true,
    },
    {
        field: 'parent',
        headerName: t('pages.category.table.parent'),
        width: 150,
        editable: false,
        renderCell: (params) => {
            return params.value
                ? <Chip size="small" label={params.value.name} />
                : '_';
        }
    },
    {
        field: 'description',
        headerName: t('pages.category.table.description'),
        width: 150,
        align: 'center',
        headerAlign: 'center',
        editable: true
    },

    {
        field: 'is_active',
        headerName: t('pages.category.table.is_active'),
        width: 150,
        align: 'center',
        headerAlign: 'center',
        editable: true,
        renderCell: (params) => (
            <Chip
                label={params.value ? 'Hiển thị' : 'Ẩn'}
                color="secondary"
                variant="outlined"
                size="small"
            />
        ),
    },
    {
        field: 'order',
        headerName: t('pages.category.table.order'),
        width: 300,
        editable: true
    },
];

export default getColumns;
