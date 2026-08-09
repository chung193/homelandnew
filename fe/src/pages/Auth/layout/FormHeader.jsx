import { Typography, Box } from '@mui/material';

export default function FormHeader({ title, subtitle, children }) {
    return (
        <Box sx={{ textAlign: 'center', mb: 1 }}>
            <Typography
                variant="h4"
                sx={{
                    fontWeight: 700,
                    mb: 1,
                    fontSize: { xs: 28, sm: 32 },
                    color: 'text.primary',
                }}
            >
                {title}
            </Typography>
            <Typography
                variant="body1"
                sx={{
                    color: 'text.secondary',
                    fontSize: 14,
                    mb: subtitle || children ? 2 : 0,
                    lineHeight: 1.6,
                }}
            >
                {subtitle}
            </Typography>
            {children}
        </Box>
    );
}
