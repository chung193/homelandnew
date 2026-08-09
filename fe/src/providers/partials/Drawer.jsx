import { Drawer as MyDrawer, Box, Typography } from '@mui/material';

const Drawer = ({ drawerTitle = '', drawerOpen = false, drawerCloseCallback = () => { }, closeDrawer = () => { }, drawerContent = null }) => {
    return <MyDrawer
        anchor='right'
        open={drawerOpen}
        onClose={() => {
            drawerCloseCallback()
            closeDrawer()
        }}
    >

        <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}><strong>{drawerTitle}</strong></Typography>
            {drawerContent}
        </Box>
    </MyDrawer>
}

export default Drawer