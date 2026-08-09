import { IconButton, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useThemeMode } from '../providers/ThemeModeProvider';

export default function ThemeSwitcherIcon() {
    const { resolvedMode, setMode } = useThemeMode();

    const handleToggle = () => {
        setMode(resolvedMode === 'dark' ? 'light' : 'dark');
    };

    const isDark = resolvedMode === 'dark';

    return (
        <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton onClick={handleToggle} size="small">
                {isDark ? (
                    <LightModeIcon fontSize="small" />
                ) : (
                    <DarkModeIcon fontSize="small" />
                )}
            </IconButton>
        </Tooltip>
    );
}
