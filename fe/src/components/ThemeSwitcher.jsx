import { ToggleButtonGroup, ToggleButton, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import { useThemeMode } from '../providers/ThemeModeProvider';

export default function ThemeSwitcher() {
    const { mode, setMode, resolvedMode } = useThemeMode();

    const handleChange = (_e, next) => {
        if (!next) return;        // ignore deselect
        setMode(next);            // 'light' | 'dark' | 'system'
    };

    return (
        <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleChange}
            size="small"
            aria-label="Theme mode"
        >
            <ToggleButton value="light" aria-label="Light">
                <Tooltip title="Light">
                    <LightModeIcon fontSize="small" />
                </Tooltip>
            </ToggleButton>
            <ToggleButton value="dark" aria-label="Dark">
                <Tooltip title="Dark">
                    <DarkModeIcon fontSize="small" />
                </Tooltip>
            </ToggleButton>
            <ToggleButton value="system" aria-label="System">
                <Tooltip title={`System (${resolvedMode})`}>
                    <SettingsBrightnessIcon fontSize="small" />
                </Tooltip>
            </ToggleButton>
        </ToggleButtonGroup>
    );
}
