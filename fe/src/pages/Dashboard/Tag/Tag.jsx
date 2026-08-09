import { useEffect, useMemo, useState } from "react";
import MainCard from "@components/MainCard";
import { useGlobalContext } from "@providers/GlobalProvider";
import { useTranslation } from "react-i18next";
import { bulkDestroy, getAll, storage, tagExport, update } from "./TagServices";
import { DataGrid } from "@mui/x-data-grid";
import Toolbar from "@components/ToolBar";
import getColumns from "./TagColumns";
import { getBreadcrumbs } from "./TagBreadcrumb";
import TagAdd from "./TagAddModal";
import { saveAs } from "file-saver";
import MetaData from "@components/MetaData";
import { loadListViewOptions, saveListViewOptions } from "@utils/listViewOptions";

const STORAGE_KEY = "list-view-options:tag";

const Tag = () => {
    const {
        showLoading,
        hideLoading,
        showNotification,
        openModal,
        closeModal,
        showConfirm,
        closeConfirm,
    } = useGlobalContext();
    const { t } = useTranslation("dashboard");
    const breadcrumbs = getBreadcrumbs(t);
    const columns = useMemo(() => getColumns(t), [t]);
    const showOptionColumns = useMemo(
        () =>
            columns
                .filter((column) => Boolean(column.field))
                .map((column) => ({
                    field: column.field,
                    label: typeof column.headerName === "string" ? column.headerName : column.field,
                })),
        [columns]
    );
    const savedViewOptions = useMemo(
        () =>
            loadListViewOptions(STORAGE_KEY, {
                columnVisibilityModel: {},
                pageSize: 15,
                viewMode: "grid",
            }),
        []
    );
    const [rows, setRows] = useState([]);
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [columnVisibilityModel, setColumnVisibilityModel] = useState(savedViewOptions.columnVisibilityModel);
    const [viewMode, setViewMode] = useState(savedViewOptions.viewMode);

    const [rowCount, setRowCount] = useState(0);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: savedViewOptions.pageSize,
    });
    const [keyword, setKeyword] = useState("");

    useEffect(() => {
        loadData();
    }, [paginationModel, keyword]);

    useEffect(() => {
        saveListViewOptions(STORAGE_KEY, {
            columnVisibilityModel,
            pageSize: paginationModel.pageSize,
            viewMode,
        });
    }, [columnVisibilityModel, paginationModel.pageSize, viewMode]);

    const loadData = async () => {
        showLoading();
        try {
            const res = await getAll({
                page: paginationModel.page + 1,
                per_page: paginationModel.pageSize,
                keyword,
            });
            setRows(res.data.data);
            setRowCount(res.data.meta.total);
            setSelectedRows(new Set());
        } catch (err) {
            showNotification(err.response?.data?.message || "Lỗi tải dữ liệu", "error");
        } finally {
            hideLoading();
        }
    };

    const processRowUpdate = (newRow, oldRow) => {
        setRows((prev) => prev.map((row) => (row.id === oldRow.id ? newRow : row)));
        update(newRow.id, newRow)
            .then((res) => showNotification(res.data.message || "Cập nhật thành công", "success"))
            .catch((err) => showNotification(err.response?.data?.message || err.message, "error"));
        return newRow;
    };

    const handleSearch = (value) => {
        setKeyword(value);
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
    };

    const addTag = (data) => {
        showLoading();
        storage(data)
            .then(() => {
                showNotification("Thêm tag thành công", "success");
                loadData();
                closeModal();
            })
            .catch((err) => showNotification(err.response?.data?.message, "error"))
            .finally(hideLoading);
    };

    const handleDelete = () => {
        showConfirm(
            t("pages.tag.deleteConfirmTitle"),
            t("pages.tag.deleteConfirmMessage", { count: selectedRows.size }),
            doDelete,
            closeModal
        );
    };

    const doDelete = async () => {
        showLoading();
        try {
            await bulkDestroy(Array.from(selectedRows));
            showNotification("Xóa thành công", "success");
            closeConfirm();
            loadData();
        } catch (err) {
            showNotification(err.response?.data?.message || err.message, "error");
        } finally {
            hideLoading();
        }
    };

    const handleExportExcel = async () => {
        try {
            showLoading("Đang xuất file...");
            const response = await tagExport({ keyword });
            const blob = new Blob([response.data], {
                type: response.headers["content-type"],
            });
            saveAs(blob, `tag_${new Date().toISOString().split("T")[0]}.xlsx`);
            showNotification("Xuất file Excel thành công", "success");
        } catch (err) {
            showNotification(err.response?.data?.message || "Lỗi khi export", "error");
        } finally {
            hideLoading();
        }
    };

    return (
        <MainCard
            pageTitle={t("pages.tag.title")}
            pageDescription={t("pages.tag.description")}
            breadcrumbs={breadcrumbs}
        >
            <MetaData title="Tag Management" description="Tag management page" />
            <Toolbar
                loadData={loadData}
                handleAdd={() =>
                    openModal(
                        t("pages.tag.addTag"),
                        <TagAdd onSubmit={addTag} onClose={closeModal} />
                    )
                }
                deleteDisabled={selectedRows.size === 0}
                handleDelete={handleDelete}
                handleSearch={handleSearch}
                handleDownload={handleExportExcel}
                showOptionColumns={showOptionColumns}
                columnVisibilityModel={columnVisibilityModel}
                handleColumnVisibilityModelChange={setColumnVisibilityModel}
                pageSize={paginationModel.pageSize}
                handlePageSizeChange={(pageSize) =>
                    setPaginationModel((prev) => ({ ...prev, page: 0, pageSize }))
                }
                viewMode={viewMode}
                handleViewModeChange={setViewMode}
            />

            <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(row) => row.id}
                checkboxSelection
                disableRowSelectionOnClick
                onRowSelectionModelChange={(newSelection) => {
                    setSelectedRows(new Set(newSelection.ids));
                }}
                pagination
                paginationMode="server"
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={setColumnVisibilityModel}
                rowCount={rowCount}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[10, 15, 30, 50]}
                loading={false}
                processRowUpdate={processRowUpdate}
                getRowHeight={() => "auto"}
                density={viewMode === "list" ? "comfortable" : "standard"}
            />
        </MainCard>
    );
};

export default Tag;
