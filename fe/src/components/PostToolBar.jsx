import { Stack, IconButton, Divider, Tooltip, Button, FormControl, InputLabel, Select, MenuItem, Collapse, Box } from '@mui/material';
import { RestartAlt, Add, Delete, Search, Download, UploadFile, FilterAlt, Tune } from '@mui/icons-material';
import InputBase from '@mui/material/InputBase';
import { styled } from '@mui/material/styles';
import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ShowOption from './ShowOption';

const SearchBox = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: 'background.default',
    '&:hover': {
        backgroundColor: 'background.paper'
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    width: '100%',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        border: '1px solid',
        borderColor: theme.palette.divider,
        borderRadius: theme.shape.borderRadius,
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        [theme.breakpoints.up('sm')]: {
            width: '12ch',
            '&:focus': {
                width: '20ch',
            },
        },
    },
}));

const PostToolbar = ({
    categories = [],
    dates = [],
    loadData = () => { },
    handleSearch = () => { },
    handleAdd = () => { },
    handleDelete = () => { },
    handleDownload = () => { },
    handleImport = () => { },
    deleteDisabled = false,
    importDisabled = false,
    showOptionColumns = [],
    columnVisibilityModel = {},
    handleColumnVisibilityModelChange = () => { },
    pageSize = 15,
    handlePageSizeChange = () => { },
    viewMode = 'grid',
    handleViewModeChange = () => { },
}) => {
    const [searchValue, setSearchValue] = useState('');
    const [showOptionPanel, setShowOptionPanel] = useState(false);
    const fileInputRef = useRef(null);
    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            handleImport(file);
        }
        event.target.value = '';
    };
    const { t } = useTranslation('common');
    const handleSearchClick = () => {
        handleSearch(searchValue);
    }

    return (
        <>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
            >
                <Stack
                    direction="row"
                    spacing={2}
                >
                    <SearchBox>
                        <SearchIconWrapper>
                            <Search />
                        </SearchIconWrapper>
                        <StyledInputBase
                            size="small"
                            placeholder={t('search')}
                            inputProps={{ 'aria-label': 'search' }}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearchClick();
                                }
                            }}
                        />
                    </SearchBox>
                    {categories &&
                        <FormControl fullWidth sx={{ minWidth: 200 }} size="small">
                            <InputLabel id="demo-select-label">
                                Chọn một danh mục
                            </InputLabel>

                            <Select
                                labelId="demo-select-label"
                                id="demo-select"
                                size="small"
                                //value={value}
                                label="Chọn danh mục"
                            //onChange={handleChange}
                            >
                                <MenuItem value="">
                                    <em>Không chọn</em>
                                </MenuItem>
                                {categories && categories.map((cat) => (
                                    <MenuItem key={cat.id} value={cat.id} >
                                        {cat.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    }
                    {dates &&
                        <FormControl fullWidth sx={{ minWidth: 200 }} size="small">
                            <InputLabel id="demo-select-label">
                                Tất cả các ngày
                            </InputLabel>

                            <Select
                                labelId="demo-select-label"
                                id="demo-select"
                                size="small"
                                //value={value}
                                label="Chọn danh mục"
                            //onChange={handleChange}
                            >
                                <MenuItem value="">
                                    <em>Không chọn</em>
                                </MenuItem>
                                {dates && dates.map((date) => (
                                    <MenuItem key={date.value} value={date.value} >
                                        {date.value}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    }
                    <Tooltip title={t("filter")}>
                        <Button
                            sx={{ pl: 4, pr: 4 }}
                            variant="outlined"
                            size="small"
                            startIcon={<FilterAlt />}
                            onClick={handleAdd}
                        >
                            {t("filter")}
                        </Button>
                    </Tooltip>
                </Stack>

                <Stack direction="row" spacing={1}>
                    <IconButton onClick={handleAdd}>
                        <Tooltip title={t('add')}>
                            <Add />
                        </Tooltip>
                    </IconButton>

                    <IconButton onClick={handleDelete} disabled={deleteDisabled}>
                        <Tooltip title={t('delete')}>
                            <Delete />
                        </Tooltip>
                    </IconButton>

                    <IconButton onClick={loadData}>
                        <Tooltip title={t('reload')}>
                            <RestartAlt />
                        </Tooltip>
                    </IconButton>
                    <IconButton onClick={handleDownload}>
                        <Tooltip title={t('export')}>
                            <Download />
                        </Tooltip>
                    </IconButton>
                    <IconButton onClick={() => fileInputRef.current?.click()} disabled={importDisabled}>
                        <Tooltip title={t('import')}>
                            <UploadFile />
                        </Tooltip>
                    </IconButton>
                    <IconButton onClick={() => setShowOptionPanel((prev) => !prev)}>
                        <Tooltip title="Display option">
                            <Tune />
                        </Tooltip>
                    </IconButton>
                </Stack>
            </Stack>
            <input
                ref={fileInputRef}
                type="file"
                accept=".xml"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
            <Collapse in={showOptionPanel} timeout="auto" unmountOnExit>
                <Box sx={{ mt: 2 }}>
                    <ShowOption
                        columns={showOptionColumns}
                        columnVisibilityModel={columnVisibilityModel}
                        perPage={pageSize}
                        viewMode={viewMode}
                        onChangeColumnVisibilityModel={handleColumnVisibilityModelChange}
                        onChangePerPage={handlePageSizeChange}
                        onChangeViewMode={handleViewModeChange}
                    />
                </Box>
            </Collapse>

            <Divider sx={{ my: 2 }} />
        </>
    );
}

export default PostToolbar;
