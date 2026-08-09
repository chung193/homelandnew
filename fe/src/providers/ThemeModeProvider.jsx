import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { makeMuiTheme } from '@theme/muiTheme';

const ThemeModeContext = createContext();

export function ThemeModeProvider({ children, lang: langProp }) {
    const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
    const [mode, setMode] = useState(() => localStorage.getItem('theme_mode') || 'system');

    // lang lấy ưu tiên từ prop; fallback localStorage -> <html lang> -> 'vi'
    const lang = useMemo(
        () => langProp || localStorage.getItem('lang') || document.documentElement.lang || 'vi',
        [langProp]
    );

    // đồng bộ color-scheme + nhớ lựa chọn
    useEffect(() => {
        localStorage.setItem('theme_mode', mode);
        const resolved = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;
        document.documentElement.dataset.theme = mode; // optional hook cho CSS
        document.documentElement.style.colorScheme = resolved; // scrollbar, form control...
    }, [mode, prefersDark]);

    const resolvedMode = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;

    // ⚡ Dùng theme đã build: makeMuiTheme(lang, resolvedMode)
    const theme = useMemo(() => makeMuiTheme(lang, resolvedMode), [lang, resolvedMode]);

    const value = useMemo(() => ({ mode, setMode, resolvedMode }), [mode, resolvedMode]);

    return (
        <ThemeModeContext.Provider value={value}>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </ThemeModeContext.Provider>
    );
}

export function useThemeMode() {
    const ctx = useContext(ThemeModeContext);
    if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider');
    return ctx;
}
