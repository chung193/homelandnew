import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { globalSearch } from '@services/search';
import { People, Assignment, Description, FolderOpen } from '@mui/icons-material';

const typeIcons = {
    users: <People sx={{ fontSize: 18 }} />,
    posts: <Assignment sx={{ fontSize: 18 }} />,
    pages: <Description sx={{ fontSize: 18 }} />,
    categories: <FolderOpen sx={{ fontSize: 18 }} />
};

const typeLabels = {
    users: 'Users',
    posts: 'Posts',
    pages: 'Pages',
    categories: 'Categories'
};

export default function SearchBox({
    value,
    defaultValue = '',
    onChange,
    onSearch,
    placeholder = 'Search…',
    autoFocus = false,
    debounceMs = 300,
    fullWidth = false,
    sx = {}
}) {
    const navigate = useNavigate();
    const isControlled = value !== undefined;
    const [inner, setInner] = useState(defaultValue);
    const [isFocused, setIsFocused] = useState(false);
    const [results, setResults] = useState({ users: [], posts: [], pages: [], categories: [] });
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const val = isControlled ? value : inner;
    const timer = useRef(null);
    const dropdownRef = useRef(null);

    const doSearch = useMemo(
        () => (q) => {
            if (typeof onSearch === 'function') onSearch(q);
        },
        [onSearch]
    );

    // Fetch search results
    const fetchResults = async (query) => {
        if (query.length < 2) {
            setResults({ users: [], posts: [], pages: [], categories: [] });
            setShowResults(false);
            return;
        }

        setLoading(true);
        try {
            const data = await globalSearch(query);
            setResults(data);
            setShowResults(true);
        } catch (error) {
            console.error('Search error:', error);
            setResults({ users: [], posts: [], pages: [], categories: [] });
        } finally {
            setLoading(false);
        }
    };

    // Debounce typing for search results
    useEffect(() => {
        if (!val || val.length < 2) {
            setShowResults(false);
            return;
        }
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            fetchResults(val);
        }, debounceMs);
        return () => clearTimeout(timer.current);
    }, [val, debounceMs]);

    const handleChange = (e) => {
        const q = e.target.value;
        if (!isControlled) setInner(q);
        if (typeof onChange === 'function') onChange(q);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            doSearch(val);
            setShowResults(false);
        }
        if (e.key === 'Escape') {
            setShowResults(false);
        }
    };

    const clear = () => {
        if (!isControlled) setInner('');
        if (typeof onChange === 'function') onChange('');
        if (!debounceMs && typeof onSearch === 'function') onSearch('');
        setShowResults(false);
        setResults({ users: [], posts: [], pages: [], categories: [] });
    };

    const handleResultClick = (type, item) => {
        setShowResults(false);
        if (!isControlled) setInner('');
        if (typeof onChange === 'function') onChange('');

        // Navigate based on type
        if (type === 'users') {
            navigate(`/dashboard/users/${item.id}`);
        } else if (type === 'posts') {
            navigate(`/dashboard/posts/${item.id}`);
        } else if (type === 'pages') {
            navigate(`/dashboard/pages/${item.id}`);
        } else if (type === 'categories') {
            navigate(`/dashboard/categories/${item.id}`);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const hasResults = results.users.length > 0 || results.posts.length > 0 ||
        results.pages.length > 0 || results.categories.length > 0;

    return (
        <Box sx={{ position: 'relative' }} ref={dropdownRef}>
            <TextField
                size="small"
                placeholder={placeholder}
                value={val}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoFocus={autoFocus}
                fullWidth={fullWidth}
                sx={{
                    backgroundColor: 'background.searchBox',
                    borderRadius: 1,
                    transition: 'all .2s ease',
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        backgroundColor: isFocused ? 'background.paper' : 'action.hover',
                        border: isFocused ? '1px solid' : 'none',
                        borderColor: isFocused ? 'primary.main' : 'transparent',
                        '& fieldset': { border: 'none' },
                        '&:hover fieldset': { border: 'none' },
                        '&.Mui-focused fieldset': { border: 'none' },
                        '& input::placeholder': { color: 'text.secondary', opacity: 0.7 }
                    },
                    ...sx
                }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <IconButton
                                aria-label="search"
                                edge="start"
                                onClick={() => doSearch(val)}
                                size="small"
                            >
                                <SearchIcon />
                            </IconButton>
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end">
                            {loading ? (
                                <CircularProgress size={20} />
                            ) : val ? (
                                <IconButton aria-label="clear search" edge="end" onClick={clear} size="small">
                                    <ClearIcon />
                                </IconButton>
                            ) : null}
                        </InputAdornment>
                    )
                }}
            />

            {/* Results Dropdown */}
            {showResults && (
                <Paper
                    sx={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        mt: 1,
                        maxHeight: 400,
                        overflowY: 'auto',
                        zIndex: 1000,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                >
                    {loading ? (
                        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress size={30} />
                        </Box>
                    ) : hasResults ? (
                        <List>
                            {/* Users */}
                            {results.users?.length > 0 && (
                                <>
                                    <ListSubheader sticky sx={{ backgroundColor: 'action.hover' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {typeIcons.users}
                                            <span>{typeLabels.users}</span>
                                        </Box>
                                    </ListSubheader>
                                    {results.users.map((user) => (
                                        <ListItem
                                            key={user.id}
                                            button
                                            onClick={() => handleResultClick('users', user)}
                                            sx={{ py: 1, '&:hover': { backgroundColor: 'action.hover' } }}
                                        >
                                            <ListItemText
                                                primary={user.name}
                                                secondary={user.email}
                                                secondaryTypographyProps={{ noWrap: true }}
                                            />
                                        </ListItem>
                                    ))}
                                </>
                            )}

                            {/* Posts */}
                            {results.posts?.length > 0 && (
                                <>
                                    <ListSubheader sticky sx={{ backgroundColor: 'action.hover' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {typeIcons.posts}
                                            <span>{typeLabels.posts}</span>
                                        </Box>
                                    </ListSubheader>
                                    {results.posts.map((post) => (
                                        <ListItem
                                            key={post.id}
                                            button
                                            onClick={() => handleResultClick('posts', post)}
                                            sx={{ py: 1, '&:hover': { backgroundColor: 'action.hover' } }}
                                        >
                                            <ListItemText
                                                primary={post.name}
                                                secondary={post.category?.name}
                                                secondaryTypographyProps={{ noWrap: true }}
                                            />
                                        </ListItem>
                                    ))}
                                </>
                            )}

                            {/* Pages */}
                            {results.pages?.length > 0 && (
                                <>
                                    <ListSubheader sticky sx={{ backgroundColor: 'action.hover' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {typeIcons.pages}
                                            <span>{typeLabels.pages}</span>
                                        </Box>
                                    </ListSubheader>
                                    {results.pages.map((page) => (
                                        <ListItem
                                            key={page.id}
                                            button
                                            onClick={() => handleResultClick('pages', page)}
                                            sx={{ py: 1, '&:hover': { backgroundColor: 'action.hover' } }}
                                        >
                                            <ListItemText primary={page.name} />
                                        </ListItem>
                                    ))}
                                </>
                            )}

                            {/* Categories */}
                            {results.categories?.length > 0 && (
                                <>
                                    <ListSubheader sticky sx={{ backgroundColor: 'action.hover' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {typeIcons.categories}
                                            <span>{typeLabels.categories}</span>
                                        </Box>
                                    </ListSubheader>
                                    {results.categories.map((cat) => (
                                        <ListItem
                                            key={cat.id}
                                            button
                                            onClick={() => handleResultClick('categories', cat)}
                                            sx={{ py: 1, '&:hover': { backgroundColor: 'action.hover' } }}
                                        >
                                            <ListItemText primary={cat.name} />
                                        </ListItem>
                                    ))}
                                </>
                            )}
                        </List>
                    ) : (
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                No results found
                            </Typography>
                        </Box>
                    )}
                </Paper>
            )}
        </Box>
    );
}
