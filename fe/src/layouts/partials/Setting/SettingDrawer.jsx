import ThemeSwitcher from '@components/ThemeSwitcher'
import LanguageSwitcher from '@components/LanguageSwitcher'
import { Box, Divider, Stack, Typography } from '@mui/material'
const SettingDrawer = () => {
    return (
        <Box sx={{
            minWidth: 300
        }}>
            <Typography variant='h6'>Settings</Typography>
            <Stack spacing={2} sx={{ py: 2 }}>
                <Typography variant='body1'>Colors</Typography>
                <ThemeSwitcher />
                <Divider />
                <Typography variant='body1'>Languages</Typography>
                <LanguageSwitcher />
                <Divider />
            </Stack>
        </Box>
    )
}

export default SettingDrawer