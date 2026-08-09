import { Stack, IconButton, Divider, Tooltip, Collapse, Box } from '@mui/material';
import { RestartAlt, Add, Delete, Search, Download, Tune } from '@mui/icons-material';
import InputBase from '@mui/material/InputBase';
import { styled } from '@mui/material/styles';
import { useState } from 'react';
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

const Toolbar = ({
    loadData = () => { },
    handleSearch = () => { },
    handleAdd = () => { },
    handleDelete = () => { },
    handleDownload = () => { },
    deleteDisabled = false,
    showOption = true,
    showAdd = true,
    showDelete = true,
    showDownload = true,
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

                <Stack direction="row" spacing={1}>
                    {showAdd && (
                        <IconButton onClick={handleAdd}>
                            <Tooltip title={t('add')}>
                                <Add />
                            </Tooltip>
                        </IconButton>
                    )}

                    {showDelete && (
                        <IconButton onClick={handleDelete} disabled={deleteDisabled}>
                            <Tooltip title={t('delete')}>
                                <Delete />
                            </Tooltip>
                        </IconButton>
                    )}

                    <IconButton onClick={loadData}>
                        <Tooltip title={t('reload')}>
                            <RestartAlt />
                        </Tooltip>
                    </IconButton>

                    {showDownload && (
                        <IconButton onClick={handleDownload}>
                            <Tooltip title={t('export')}>
                                <Download />
                            </Tooltip>
                        </IconButton>
                    )}

                    {showOption && (
                        <IconButton onClick={() => setShowOptionPanel((prev) => !prev)}>
                            <Tooltip title="Display option">
                                <Tune />
                            </Tooltip>
                        </IconButton>
                    )}
                </Stack>
            </Stack>
            <Collapse in={showOption && showOptionPanel} timeout="auto" unmountOnExit>
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

export default Toolbar;

