import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Breadcrumbs, Typography, Link, Stack } from '@mui/material';

const Breadcrumb = ({ breadcrumbs }) => {
    return (
        <Stack direction={'row'}
            sx={{
                justifyContent: "space-between",
                alignItems: "baseline",
                my: 2,
                width: '100%'
            }}>
            <Typography variant='h5'>
                <strong>{breadcrumbs[breadcrumbs.length - 1].label}</strong>
            </Typography>
            <Breadcrumbs aria-label="breadcrumb" separator={<NavigateNextIcon fontSize="small" />} >
                {breadcrumbs.map((item, index) =>
                    <Typography variant='subtitle1' key={item.label}>
                        <Link
                            underline="hover"
                            color="inherit"
                            href={item.path}
                        >
                            {index === breadcrumbs.length - 1
                                ? <Typography variant='subtitle1'><strong><span>{item.label}</span></strong></Typography>
                                : <Typography component="span" variant='subtitle1'><span>{item.label}</span></Typography>}
                        </Link>
                    </Typography>
                )}
            </Breadcrumbs>
        </Stack>
    );
};

export default Breadcrumb;