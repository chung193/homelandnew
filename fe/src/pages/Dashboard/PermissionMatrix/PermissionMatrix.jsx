import { useState, useEffect } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import PermissionMatrixTable from './PermissionMatrixTable';
import MetaData from '@components/MetaData';
import MainCard from "@components/MainCard";
import { useTranslation } from 'react-i18next';
import { getBreadcrumbs } from './PermissionMatrixBreadcrumb';
import { getAllRole, getAllPermission, updateRolePermissions } from './PermissionMatrixServices';
import { useGlobalContext } from '@providers/GlobalProvider';

const PermissionMatrix = () => {
    const { showLoading, hideLoading, showNotification } = useGlobalContext();
    const { t } = useTranslation('dashboard');
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [permissionsMatrix, setPermissionsMatrix] = useState({});
    const [originalMatrix, setOriginalMatrix] = useState({});

    useEffect(() => {
        showLoading();
        const fetchData = async () => {
            Promise.all([getAllRole(), getAllPermission()])
                .then(([rolesRes, permissionsRes]) => {
                    setRoles(rolesRes.data.data);
                    setPermissions(permissionsRes.data.data);
                    const initialized = {};
                    rolesRes.forEach((role) => {
                        initialized[role.id] = {};
                        permissionsRes.forEach((perm) => {
                            const hasPermission = role.permissions?.some(p => p.id === perm.id);
                            initialized[role.id][perm.id] = !!hasPermission;
                        });
                    });
                    setPermissionsMatrix(initialized);
                    setOriginalMatrix(initialized);
                    hideLoading();
                })
                .catch(error => {
                    hideLoading();
                    showNotification('error', 'Lỗi khi tải dữ liệu', error.message);
                });
        }
        fetchData();
    }, []);

    const handleSave = async () => {
        showLoading();
        try {
            const promises = roles.map((role) => {
                const permissionIds = Object.keys(permissionsMatrix[role.id] || {})
                    .filter(permId => permissionsMatrix[role.id][permId])
                    .map(Number);

                return updateRolePermissions(role.id, permissionIds);
            });

            await Promise.all(promises);

            showNotification('success', 'Cập nhật quyền thành công');
            setOriginalMatrix(permissionsMatrix);
        } catch (error) {
            showNotification(error.response?.data?.message || error.message, 'error');
        } finally {
            hideLoading();
        }
    };

    const handleCancel = () => {
        setPermissionsMatrix(originalMatrix);
    };

    const breadcrumbs = getBreadcrumbs(t);

    return (
        <MainCard
            pageTitle={t('pages.role.title')}
            pageDescription={t('pages.role.description')}
            breadcrumbs={breadcrumbs}
        >
            <MetaData
                title="Permission Matrix"
                description="Permission matrix management page"
            />
            <Typography component="p" sx={{ mb: 2 }}>Control access level and assign roles to your team</Typography>
            <PermissionMatrixTable
                roles={roles}
                permissions={permissions}
                value={permissionsMatrix}
                onChange={setPermissionsMatrix}
            />
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleCancel}
                >
                    Huỷ
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                >
                    Lưu
                </Button>
            </Stack>
        </MainCard >
    );
};

export default PermissionMatrix;