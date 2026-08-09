import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    Paper,
    Typography,
    Box,
} from '@mui/material';

const PermissionMatrixTable = ({ roles = [], permissions = [], value = {}, onChange }) => {
    const [matrixValue, setMatrixValue] = useState({});

    useEffect(() => {
        if (Object.keys(value).length > 0) {
            setMatrixValue(value);
        } else {
            const initialized = {};
            roles.forEach((role) => {
                initialized[role.id] = {};
                permissions.forEach((perm) => {
                    const hasPermission = role.permissions?.some(p => p.id === perm.id);
                    initialized[role.id][perm.id] = !!hasPermission;
                });
            });
            setMatrixValue(initialized);
        }
    }, [roles, permissions, value]);

    const togglePermission = (roleId, permissionId) => {
        const newValue = {
            ...matrixValue,
            [roleId]: {
                ...(matrixValue[roleId] || {}),
                [permissionId]: !matrixValue?.[roleId]?.[permissionId],
            },
        };
        setMatrixValue(newValue);
        onChange(newValue);
    };

    const toggleRole = (roleId) => {
        const allChecked = permissions.every(
            (p) => matrixValue?.[roleId]?.[p.id]
        );

        const updatedPerms = {};
        permissions.forEach((p) => {
            updatedPerms[p.id] = !allChecked;
        });

        const newValue = {
            ...matrixValue,
            [roleId]: {
                ...(matrixValue[roleId] || {}),
                ...updatedPerms,
            },
        };
        setMatrixValue(newValue);
        onChange(newValue);
    };

    const togglePermissionRow = (permissionId) => {
        const allChecked = roles.every(
            (r) => matrixValue?.[r.id]?.[permissionId]
        );

        const updated = { ...matrixValue };

        roles.forEach((r) => {
            updated[r.id] = {
                ...(updated[r.id] || {}),
                [permissionId]: !allChecked,
            };
        });

        setMatrixValue(updated);
        onChange(updated);
    };

    const isRoleFullyChecked = (roleId) => {
        return permissions.every((p) => matrixValue?.[roleId]?.[p.id]);
    };

    const isRoleIndeterminate = (roleId) => {
        const someChecked = permissions.some((p) => matrixValue?.[roleId]?.[p.id]);
        const allChecked = isRoleFullyChecked(roleId);
        return someChecked && !allChecked;
    };

    const isPermissionFullyChecked = (permissionId) => {
        return roles.every((r) => matrixValue?.[r.id]?.[permissionId]);
    };

    const isPermissionIndeterminate = (permissionId) => {
        const someChecked = roles.some((r) => matrixValue?.[r.id]?.[permissionId]);
        const allChecked = isPermissionFullyChecked(permissionId);
        return someChecked && !allChecked;
    };

    return (
        <TableContainer component={Paper} variant="outlined">
            <Table size="small">
                <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{
                            minWidth: 250,
                            // verticalAlign: 'top'
                        }}>
                            <Typography fontWeight={600}>
                                Quyền / Vai trò
                            </Typography>
                        </TableCell>

                        {roles.map((role) => (
                            <TableCell key={role.id} align="center" sx={{ minWidth: 150 }}>
                                <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                                    <Typography fontWeight={600} noWrap title={role.name}>
                                        {role.name}
                                    </Typography>
                                    <Checkbox
                                        size="small"
                                        checked={isRoleFullyChecked(role.id)}
                                        indeterminate={isRoleIndeterminate(role.id)}
                                        onChange={() => toggleRole(role.id)}
                                        title={isRoleFullyChecked(role.id) ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                                    />
                                </Box>
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>

                <TableBody>
                    {permissions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={roles.length + 1} align="center">
                                <Typography color="textSecondary">
                                    Không có quyền nào
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        permissions.map((perm) => (
                            <TableRow key={perm.id} hover>
                                <TableCell sx={{ minWidth: 250 }}>
                                    <Box display="flex" alignItems="flex-start" gap={2}>
                                        <Checkbox
                                            size="small"
                                            checked={isPermissionFullyChecked(perm.id)}
                                            indeterminate={isPermissionIndeterminate(perm.id)}
                                            onChange={() => togglePermissionRow(perm.id)}
                                            title={isPermissionFullyChecked(perm.id) ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                                            sx={{ marginTop: '4px' }}
                                        />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography fontWeight={600}>
                                                {perm.name}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {perm.description}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>

                                {roles.map((role) => (
                                    <TableCell key={`${role.id}-${perm.id}`} align="center">
                                        <Checkbox
                                            size="small"
                                            checked={!!matrixValue?.[role.id]?.[perm.id]}
                                            onChange={() =>
                                                togglePermission(role.id, perm.id)
                                            }
                                        />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default PermissionMatrixTable;