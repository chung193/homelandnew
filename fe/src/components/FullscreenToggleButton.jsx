import { useEffect, useState, useCallback } from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

/**
 * Props:
 * - targetRef?: React.RefObject<HTMLElement>  // phần tử muốn fullscreen; bỏ trống = cả trang
 * - ...props:                                  // props IconButton (size, color, sx, edge, etc.)
 */
export default function FullscreenToggleButton({ targetRef, ...props }) {
    const [isFs, setIsFs] = useState(false);

    const getFsElement = () =>
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement;

    useEffect(() => {
        const handleChange = () => setIsFs(!!getFsElement());
        document.addEventListener('fullscreenchange', handleChange);
        document.addEventListener('webkitfullscreenchange', handleChange);
        document.addEventListener('MSFullscreenChange', handleChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleChange);
            document.removeEventListener('webkitfullscreenchange', handleChange);
            document.removeEventListener('MSFullscreenChange', handleChange);
        };
    }, []);

    const enter = useCallback(async () => {
        const el = targetRef?.current || document.documentElement;
        try {
            if (el.requestFullscreen) await el.requestFullscreen();
            else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen(); // Safari
            else if (el.msRequestFullscreen) el.msRequestFullscreen();         // IE/Edge cũ
        } catch (e) {
            console.error('Enter fullscreen failed:', e);
        }
    }, [targetRef]);

    const exit = useCallback(async () => {
        try {
            if (document.exitFullscreen) await document.exitFullscreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            else if (document.msExitFullscreen) document.msExitFullscreen();
        } catch (e) {
            console.error('Exit fullscreen failed:', e);
        }
    }, []);

    const toggle = useCallback(() => {
        if (getFsElement()) exit();
        else enter();
    }, [enter, exit]);

    return (
        <Tooltip title={isFs ? 'Thoát fullscreen' : 'Fullscreen'}>
            <IconButton onClick={toggle} {...props}>
                {isFs ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
        </Tooltip>
    );
}
