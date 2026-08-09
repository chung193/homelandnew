import { Typography, Box, Link } from "@mui/material";

export default function CreateBy() {
    const currentYear = new Date().getFullYear();
    return (
        <Box
            component="footer"
            sx={{
                width: '100%',
                textAlign: 'center',
                borderTop: '1px solid',
                borderColor: 'divider',
                py: 2,
                px: 2,
                backgroundColor: 'background.paper',
                mt: 4,
            }}
        >
            <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                {currentYear} © Start-Kit. Inspired by{' '}
                <Link href="https://themesbrand.com/velzon" target="_blank" rel="noopener" sx={{ fontWeight: 500 }}>
                    Velzon
                </Link>
            </Typography>
        </Box>
    );
}