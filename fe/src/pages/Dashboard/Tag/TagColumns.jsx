const getColumns = (t) => [
    {
        field: "stt",
        headerName: t("pages.tag.table.stt"),
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
        field: "name",
        headerName: t("pages.tag.table.name"),
        width: 260,
        editable: true,
    },
    {
        field: "slug",
        headerName: t("pages.tag.table.slug"),
        width: 320,
        editable: true,
    },
    {
        field: "created_at",
        headerName: t("pages.tag.table.createdAt"),
        width: 200,
        editable: false,
        renderCell: (params) => new Date(params.value).toLocaleString(),
    },
    {
        field: "updated_at",
        headerName: t("pages.tag.table.updatedAt"),
        width: 200,
        editable: false,
        renderCell: (params) => new Date(params.value).toLocaleString(),
    },
];

export default getColumns;
