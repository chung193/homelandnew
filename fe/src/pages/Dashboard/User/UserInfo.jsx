import { useEffect, useMemo, useState } from 'react'
import { show, getAllRole, assignRoles } from "./UserServices";
import { Box, Typography, Stack, Avatar, Chip, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Button } from '@mui/material';
import { useGlobalContext } from '@providers/GlobalProvider';
import { getMediaUrl } from '@utils/mediaUrl';

const UserInfo = ({ id }) => {
    const [user, setUser] = useState({})
    const [roles, setRoles] = useState([])
    const [selectedRoleIds, setSelectedRoleIds] = useState([])
    const [savingRoles, setSavingRoles] = useState(false)
    const { showNotification } = useGlobalContext()

    const loadUser = () => {
        return show(id)
            .then(res => {
                const nextUser = res.data.data || {}
                setUser(nextUser)
                setSelectedRoleIds(Array.isArray(nextUser.roles) ? nextUser.roles.map((role) => role.id) : [])
            })
    }

    useEffect(() => {
        if (!id) return

        Promise.all([
            loadUser(),
            getAllRole({ per_page: 100 })
        ])
            .then(([, roleRes]) => {
                setRoles(roleRes.data.data || [])
            })
            .catch(err => {
                console.log(err)
                showNotification(err.response?.data?.message || 'Không tải được dữ liệu người dùng', 'error')
            })
    }, [id])

    const selectedRoleNames = useMemo(() => {
        if (!Array.isArray(user.roles)) {
            return []
        }

        return user.roles.map((role) => role.name).filter(Boolean)
    }, [user.roles])

    const handleSaveRoles = () => {
        setSavingRoles(true)

        assignRoles(id, selectedRoleIds)
            .then((res) => {
                const nextUser = res.data.data || {}
                setUser((prev) => ({ ...prev, ...nextUser }))
                setSelectedRoleIds(Array.isArray(nextUser.roles) ? nextUser.roles.map((role) => role.id) : [])
                showNotification(res.data.message || 'Cập nhật role thành công', 'success')
            })
            .catch((err) => {
                showNotification(err.response?.data?.message || 'Không cập nhật được role', 'error')
            })
            .finally(() => setSavingRoles(false))
    }

    return (
        <Box>
            <Stack direction="column" spacing="4" alignItems="center">
                <Box sx={{ p: 2 }}>
                    <Avatar
                        alt={user.name}
                        src={getMediaUrl(user.avatar)}
                        sx={{
                            width: 100,
                            height: 100,
                            border: '4px solid #2c3e50'
                        }}
                    />
                </Box>

                <Typography><strong>{user.name}</strong> </Typography>
                <Typography sx={{ color: '#7f8c8d' }}><span>{user.detail?.position}</span></Typography>
            </Stack>

            <Typography sx={{ mb: 2, mt: 3 }} variant="h6">
                <strong>Role</strong>
            </Typography>

            <Stack spacing={1.5} sx={{ mb: 3 }}>
                <FormControl fullWidth size="small">
                    <InputLabel id="user-role-select-label">Roles</InputLabel>
                    <Select
                        labelId="user-role-select-label"
                        multiple
                        value={selectedRoleIds}
                        onChange={(event) => setSelectedRoleIds(event.target.value)}
                        input={<OutlinedInput label="Roles" />}
                        renderValue={(selected) => roles
                            .filter((role) => selected.includes(role.id))
                            .map((role) => role.name)
                            .join(', ')}
                    >
                        {roles.map((role) => (
                            <MenuItem key={role.id} value={role.id}>
                                {role.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {selectedRoleNames.length > 0 ? selectedRoleNames.map((roleName) => (
                        <Chip key={roleName} label={roleName} size="small" color="primary" variant="outlined" />
                    )) : (
                        <Typography variant="body2" sx={{ color: '#7f8c8d' }}>Chưa gán role nào</Typography>
                    )}
                </Stack>

                <Button
                    variant="contained"
                    size="small"
                    onClick={handleSaveRoles}
                    disabled={savingRoles}
                    sx={{ alignSelf: 'flex-start' }}
                >
                    {savingRoles ? 'Đang lưu...' : 'Lưu role'}
                </Button>
            </Stack>

            <Typography sx={{ mb: 2 }} variant="h6">
                <strong>Portfolio</strong>
            </Typography>

            <Stack direction="column" spacing="2" sx={{ mb: 2 }}>
                <Stack direction="row" spacing="2">
                    <Typography sx={{ width: 120 }}><strong>Email</strong></Typography>
                    <Typography>{user.email}</Typography>
                </Stack>
            </Stack>

            <Stack direction="column" spacing="2" sx={{ mb: 2 }}>
                <Stack direction="row" spacing="2">
                    <Typography sx={{ width: 120 }}><strong>Github</strong></Typography>
                    <Typography>{user.detail?.github}</Typography>
                </Stack>
            </Stack>

            <Stack direction="column" spacing="2" sx={{ mb: 2 }}>
                <Stack direction="row" spacing="2">
                    <Typography sx={{ width: 120 }}><strong>Website</strong></Typography>
                    <Typography>{user.detail?.website}</Typography>
                </Stack>
            </Stack>

            <Stack direction="column" spacing="2" sx={{ mb: 2 }}>
                <Stack direction="row" spacing="2">
                    <Typography sx={{ width: 120 }}><strong>Mobile</strong></Typography>
                    <Typography>{user.detail?.phone}</Typography>
                </Stack>
            </Stack>

            <Stack direction="column" spacing="2" sx={{ mb: 2 }}>
                <Stack direction="row" spacing="2">
                    <Typography sx={{ width: 120 }}><strong>Address</strong></Typography>
                    <Typography>{user.detail?.address}</Typography>
                </Stack>
            </Stack>

            <Stack direction="column" spacing="2" sx={{ mb: 2 }}>
                <Stack direction="row" spacing="2">
                    <Typography sx={{ width: 120 }}><strong>City</strong></Typography>
                    <Typography>{user.detail?.city}</Typography>
                </Stack>
            </Stack>

            <Stack direction="column" spacing="2" sx={{ mb: 2 }}>
                <Stack direction="row" spacing="2">
                    <Typography sx={{ width: 120 }}><strong>Join date</strong></Typography>
                    <Typography>{user.detail?.join_date}</Typography>
                </Stack>
            </Stack>
        </Box>
    )
}

export default UserInfo
