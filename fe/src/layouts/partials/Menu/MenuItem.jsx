import { useCallback, useMemo } from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Tooltip from '@mui/material/Tooltip';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

const isPathActive = (item, pathname) => {
    if (!item?.url || /^javascript:/i.test(item.url)) return false;
    return pathname === item.url || pathname.startsWith(`${item.url}/`);
};

const hasActiveDescendant = (children, pathname) => {
    if (!Array.isArray(children)) return false;
    return children.some((child) => isPathActive(child, pathname) || hasActiveDescendant(child.children, pathname));
};

export default function MenuItem({
    item,
    level = 0,
    openMap,
    setOpenMap,
    onNavigate,
    renderIcon,
    siblings = [],
}) {
    const hasChildren = Array.isArray(item.children) && item.children.length > 0;
    const isOpen = !!openMap[item.id];
    const isCollapsed = useSelector((state) => state.ui.data.CollapseMenu);
    const { pathname } = useLocation();
    const isChild = level > 0;

    const paddingLeft = isCollapsed ? 1 : 1.5 + level * 1.8;
    const isSelected = useMemo(
        () => isPathActive(item, pathname) || hasActiveDescendant(item.children, pathname),
        [item, pathname]
    );

    const handleToggle = useCallback(() => {
        setOpenMap((prev) => {
            const newMap = { ...prev };

            // If opening this item, close all siblings (accordion behavior)
            if (!newMap[item.id]) {
                siblings.forEach((sibling) => {
                    if (sibling.id !== item.id && Array.isArray(sibling.children) && sibling.children.length > 0) {
                        newMap[sibling.id] = false;
                    }
                });
            }

            // Toggle current item
            newMap[item.id] = !newMap[item.id];
            return newMap;
        });
    }, [setOpenMap, item.id, siblings]);

    const handleClickLeaf = useCallback(() => {
        if (item.disabled) return;
        if (typeof item.onClick === 'function') item.onClick();
        if (item.url) onNavigate(item.url, item.external, item.target);
    }, [item, onNavigate]);

    const row = (
        <ListItemButton
            selected={isSelected}
            onClick={hasChildren ? handleToggle : handleClickLeaf}
            disabled={item.disabled}
            sx={{
                minHeight: 40,
                mb: 0,
                mx: 0,
                px: isCollapsed ? 1.5 : 1.5,
                py: 0.625,
                pl: paddingLeft,
                pr: isCollapsed ? 1.5 : 1.5,
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                borderRadius: 0,
                color: isSelected ? 'common.white' : 'rgba(255, 255, 255, 0.75)',
                backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                fontWeight: isSelected ? 600 : 500,
                fontSize: '0.9375rem',
                transition: 'all .25s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                borderLeft: isSelected ? '3px solid currentColor' : '3px solid transparent',
                paddingLeft: isCollapsed ? 1.5 : 'calc(1.5rem - 3px)',
                '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'common.white',
                },
                '&.Mui-focusVisible': {
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                },
                '&.Mui-selected': {
                    color: 'common.white',
                    fontWeight: 600,
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderLeft: '3px solid rgba(255, 255, 255, 0.9)',
                },
                '&.Mui-disabled': {
                    opacity: 0.5,
                },
            }}
        >
            {item.icon && (
                <ListItemIcon
                    sx={{
                        color: 'inherit',
                        minWidth: isCollapsed ? 0 : 34,
                        mr: isCollapsed ? 0 : 0.5,
                        justifyContent: 'center',
                    }}
                >
                    {renderIcon(item.icon)}
                </ListItemIcon>
            )}
            {!isCollapsed && (
                <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                        fontSize: isChild ? 13 : 13.5,
                        fontWeight: isSelected ? 600 : 500,
                        lineHeight: 1.3,
                        letterSpacing: '0.3px',
                    }}
                    sx={{
                        m: 0,
                        '& .MuiListItemText-primary': {
                            display: 'flex',
                            alignItems: 'center',
                            gap: isChild ? 1 : 0,
                        },
                        ...(isChild
                            ? {
                                '& .MuiListItemText-primary::before': {
                                    content: '""',
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    backgroundColor: isSelected ? '#fff' : 'rgba(255, 255, 255, 0.6)',
                                    flexShrink: 0,
                                    transition: 'all .2s ease',
                                },
                            }
                            : {}),
                    }}
                />
            )}
            {hasChildren && !isCollapsed ? (isOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />) : null}
        </ListItemButton>
    );

    return (
        <>
            <Tooltip title={isCollapsed ? item.label : ''} placement="right">
                {row}
            </Tooltip>
            {hasChildren && !isCollapsed && (
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{ ml: 0.25 }}>
                        {item.children.map((child) => (
                            <MenuItem
                                key={child.id}
                                item={child}
                                level={level + 1}
                                openMap={openMap}
                                setOpenMap={setOpenMap}
                                onNavigate={onNavigate}
                                renderIcon={renderIcon}
                                siblings={item.children}
                            />
                        ))}
                    </List>
                </Collapse>
            )}
        </>
    );
}
