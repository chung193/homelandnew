'use client';

import { useRef } from 'react';
import { Icon, type IconName } from '@astryxdesign/core/Icon';
import { useThemeMode, type UIMode } from '../../app/providers';

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

const MODE_ICONS: Record<UIMode, IconName> = {
    system: 'viewColumns',
    light: 'success',
    dark: 'eyeSlash',
    night: 'clock',
};

export default function ThemeModeToggle({ labels }: ThemeModeToggleProps) {
    const { mode, setMode } = useThemeMode();
    const detailsRef = useRef<HTMLDetailsElement>(null);

    const selectMode = (nextMode: UIMode) => {
        setMode(nextMode);
        detailsRef.current?.removeAttribute('open');
    };

    return (
        <details ref={detailsRef} className="relative">
            <summary
                className="topbar-select select-soft flex h-9 cursor-pointer list-none items-center gap-2 border px-2 text-sm shadow-sm outline-none transition [&::-webkit-details-marker]:hidden"
                aria-label={`Theme mode: ${labels[mode]}`}
            >
                <Icon icon={MODE_ICONS[mode]} size="sm" />
                <span className="hidden xl:inline">{labels[mode]}</span>
                <Icon icon="chevronDown" size="xsm" color="secondary" />
            </summary>

            <div className="account-menu-panel absolute right-0 z-50 mt-2 min-w-44 overflow-hidden rounded-xl border p-1 shadow-xl">
                {MODES.map((candidate) => (
                    <button
                        key={candidate}
                        type="button"
                        onClick={() => selectMode(candidate)}
                        className="topbar-link flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition"
                        aria-pressed={candidate === mode}
                    >
                        <Icon icon={MODE_ICONS[candidate]} size="sm" />
                        <span className="flex-1">{labels[candidate]}</span>
                        {candidate === mode ? (
                            <Icon icon="check" size="xsm" color="success" />
                        ) : null}
                    </button>
                ))}
            </div>
        </details>
    );
}
