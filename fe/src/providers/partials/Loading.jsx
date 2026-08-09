import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import { Backdrop } from '@mui/material';

const Loading = () => {
    return (
        <>
            {/* Overlay backdrop để disable interactions */}
            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: 2000,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                }}
                open={true}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    <CircularProgress color="inherit" size={50} />
                </Box>
            </Backdrop>

            {/* Progress bar ở top */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    zIndex: 2001,
                    width: '100%',
                    '& > * + *': {
                        marginTop: 0
                    }
                }}
            >
                <LinearProgress color="secondary" />
            </Box>
        </>
    )
}

export default Loading
