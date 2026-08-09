import { Chip } from "@mui/material";

const getColumns = (t) => [
    {
        field: 'stt',
        headerName: t('pages.permission.table.stt'),
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
        headerName: t('pages.permission.table.name'),
        width: 150,
        editable: true,
    },
    {
        field: 'guard_name',
        headerName: t('pages.permission.table.guardName'),
        width: 150,
        align: 'center',
        headerAlign: 'center',
        editable: true,
        renderCell: (params) => (
            <Chip
                label={params.value}
                color="secondary"
                variant="outlined"
                size="small"
            />
        ),
    },
    {
        field: 'description',
        headerName: t('pages.permission.table.description'),
        width: 300,
        editable: true,
    },
    {
        field: 'created_at',
        headerName: t('pages.permission.table.createdAt'),
        width: 200,
        editable: false,
        renderCell: (params) => new Date(params.value).toLocaleString(),
    },
    {
        field: 'updated_at',
        headerName: t('pages.permission.table.updatedAt'),
        width: 200,
        editable: false,
        renderCell: (params) => new Date(params.value).toLocaleString(),
    },
];

export default getColumns;
