'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Theme } from '@astryxdesign/core/theme';
import { LinkProvider } from '@astryxdesign/core/Link';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import type { ThemeMode } from '@astryxdesign/core/theme';

export type UIMode = ThemeMode | 'night';

type ThemeModeContextValue = {
    mode: UIMode;
    setMode: (mode: UIMode) => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

type ProvidersProps = {
    children: React.ReactNode;
};

const STORAGE_KEY = 'homelend:ui-mode';

export function useThemeMode() {
    const context = useContext(ThemeModeContext);
    if (!context) {
        throw new Error('useThemeMode must be used within Providers.');
    }

    return context;
}

export function Providers({ children }: ProvidersProps) {
    const [mode, setMode] = useState<UIMode>('system');

    useEffect(() => {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored === 'system' || stored === 'light' || stored === 'dark' || stored === 'night') {
            setMode(stored);
        }
    }, []);

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, mode);
        document.documentElement.setAttribute('data-ui-mode', mode);
    }, [mode]);

    const value = useMemo(
        () => ({
            mode,
            setMode,
        }),
        [mode],
    );

    const astryxMode: ThemeMode = mode === 'night' ? 'dark' : mode;

    return (
        <ThemeModeContext.Provider value={value}>
            <Theme theme={neutralTheme} mode={astryxMode}>
                <LinkProvider component={Link}>{children}</LinkProvider>
            </Theme>
        </ThemeModeContext.Provider>
    );
}
