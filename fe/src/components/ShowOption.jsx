import {
    Typography,
    Box,
    Button,
    TextField,
    FormControlLabel,
    Checkbox,
    Stack,
    Radio,
    RadioGroup,
    FormControl,
    Paper
} from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';

const DEFAULT_COLUMNS = [
    { field: 'author', label: 'Author' },
    { field: 'categories', label: 'Categories' },
    { field: 'tags', label: 'Tags' },
    { field: 'comments', label: 'Comments' },
    { field: 'date', label: 'Date' },
];

const ShowOption = ({
    columns = DEFAULT_COLUMNS,
    columnVisibilityModel = {},
    perPage = 20,
    viewMode = 'grid',
    onChangeColumnVisibilityModel = () => { },
    onChangePerPage = () => { },
    onChangeViewMode = () => { },
    onApply = () => { },
}) => {
    const defaultVisibility = useMemo(
        () =>
            Object.fromEntries(
                columns.map((column) => [column.field, columnVisibilityModel[column.field] !== false])
            ),
        [columns, columnVisibilityModel]
    );

    const [localVisibility, setLocalVisibility] = useState(defaultVisibility);
    const [localPerPage, setLocalPerPage] = useState(perPage);
    const [localViewMode, setLocalViewMode] = useState(viewMode);

    useEffect(() => {
        setLocalVisibility(defaultVisibility);
        setLocalPerPage(perPage);
        setLocalViewMode(viewMode);
    }, [defaultVisibility, perPage, viewMode]);

    const applyChanges = () => {
        const normalizedPerPage = Number(localPerPage);
        if (Number.isFinite(normalizedPerPage) && normalizedPerPage > 0) {
            onChangePerPage(normalizedPerPage);
        }
        onChangeColumnVisibilityModel(localVisibility);
        onChangeViewMode(localViewMode);
        onApply();
    };

    return (
        <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={2}>
                <Typography component="span" variant="subtitle2">
                    Tùy chọn hiển thị
                </Typography>
                <Box>
                    <Typography component="span"><strong>Cot</strong></Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                        {columns.map((column) => (
                            <FormControlLabel
                                key={column.field}
                                control={
                                    <Checkbox
                                        checked={localVisibility[column.field] !== false}
                                        onChange={(event) =>
                                            setLocalVisibility((prev) => ({
                                                ...prev,
                                                [column.field]: event.target.checked,
                                            }))
                                        }
                                    />
                                }
                                label={column.label}
                            />
                        ))}
                    </Stack>
                </Box>
                <Box>
                    <Typography component="span"><strong>Hien thi</strong></Typography>
                    <TextField
                        hiddenLabel
                        variant="filled"
                        size="small"
                        sx={{ width: '80px', display: 'block', my: 1 }}
                        type="number"
                        value={localPerPage}
                        onChange={(event) => setLocalPerPage(event.target.value)}
                    />
                </Box>
                <Stack direction="column" spacing={1}>
                    <Typography component="span"><strong>Che do xem</strong></Typography>
                    <Box>
                        <FormControl>
                            <RadioGroup
                                value={localViewMode}
                                onChange={(event) => setLocalViewMode(event.target.value)}
                                name="view-mode"
                            >
                                <Stack direction="row" spacing={2}>
                                    <FormControlLabel value="grid" control={<Radio />} label="Grid" />
                                    <FormControlLabel value="list" control={<Radio />} label="List" />
                                </Stack>
                            </RadioGroup>
                        </FormControl>
                    </Box>
                </Stack>
                <Button
                    variant="contained"
                    size="small"
                    sx={{ width: '100px' }}
                    onClick={applyChanges}
                >
                    Lưu lại
                </Button>
            </Stack>
        </Paper>
    );
};

ShowOption.propTypes = {
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            field: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ),
    columnVisibilityModel: PropTypes.object,
    perPage: PropTypes.number,
    viewMode: PropTypes.oneOf(['grid', 'list']),
    onChangeColumnVisibilityModel: PropTypes.func,
    onChangePerPage: PropTypes.func,
    onChangeViewMode: PropTypes.func,
    onApply: PropTypes.func,
};

export default ShowOption;
