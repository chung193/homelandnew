'use client';

import { useThemeMode, type UIMode } from '../providers';

type Labels = {
    system: string;
    light: string;
    dark: string;
    night: string;
};

type ThemeModeToggleProps = {
    labels: Labels;
};

const MODES: UIMode[] = ['system', 'light', 'dark', 'night'];

const MODE_ICONS: Record<UIMode, string> = {
    system: '🖥️',
    light: '☀️',
    dark: '🌙',
    night: '🌌',
};

export default function ThemeModeToggle({ labels }: ThemeModeToggleProps) {
    const { mode, setMode } = useThemeMode();

    return (
        <label className="inline-flex items-center">
            <span className="sr-only">Theme mode</span>
            <select
                value={mode}
                onChange={(event) => setMode(event.target.value as UIMode)}
                className="topbar-select select-soft h-9 border px-2 text-sm shadow-sm outline-none transition"
                aria-label="Theme mode selector"
            >
                {MODES.map((candidate) => (
                    <option key={candidate} value={candidate}>
                        {MODE_ICONS[candidate]} {labels[candidate]}
                    </option>
                ))}
            </select>
        </label>
    );
}
