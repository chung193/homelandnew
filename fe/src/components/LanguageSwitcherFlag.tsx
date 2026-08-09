import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    IconButton,
    Menu,
    MenuItem,
    Stack,
    Typography,
    Box
} from '@mui/material';
import { setDayjsLocale } from '../theme/dateLocale';

type Lang = 'vi' | 'en';
const viFlag = (
    <img src="/vi.png" alt="Tiếng Việt" width="20" height="15" style={{ borderRadius: '2px' }} />
);
const enFlag = (
    <img src="/en.png" alt="English" width="20" height="15" style={{ borderRadius: '2px' }} />
);

const languages: Record<Lang, { label: string; flag: string }> = {
    vi: { label: 'Tiếng Việt', flag: viFlag },
    en: { label: 'English', flag: enFlag },
};

export default function LanguageSwitcherFlag() {
    const { i18n } = useTranslation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const currentLang = i18n.language as Lang;

    const setLang = useCallback(
        (next: Lang) => {
            if (i18n.language === next) return;

            i18n.changeLanguage(next);
            setDayjsLocale(next);
            document.documentElement.lang = next;
            document.documentElement.dir = 'ltr';
            localStorage.setItem('lang', next);

            setAnchorEl(null);
        },
        [i18n]
    );

    return (
        <>
            <Box sx={{ ml: 1, cursor: 'pointer' }}>
                <IconButton
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    size="small"
                >
                    {languages[currentLang]?.flag}
                </IconButton>
            </Box>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                sx={{ top: 20 }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                {(Object.keys(languages) as Lang[]).map((lang) => (
                    <MenuItem
                        key={lang}
                        selected={currentLang === lang}
                        onClick={() => setLang(lang)}
                    >
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Box fontSize={20}>
                                {languages[lang].flag}
                            </Box>
                            <Typography><span>{languages[lang].label}</span></Typography>
                        </Stack>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}
