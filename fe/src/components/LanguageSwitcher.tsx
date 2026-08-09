import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Button } from '@mui/material';
import { setDayjsLocale } from '../theme/dateLocale';

type Lang = 'vi' | 'en';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const setLang = useCallback((next: Lang) => {
        if (i18n.language === next) return;
        i18n.changeLanguage(next);
        setDayjsLocale(next);                    // đồng bộ Dayjs
        document.documentElement.lang = next;    // set <html lang="">
        document.documentElement.dir = 'ltr';    // nếu sau này có RTL thì đổi
        localStorage.setItem('lang', next);      // nhớ lựa chọn
    }, [i18n]);

    return (
        <Stack direction="row" spacing={1}>
            <Button
                variant={i18n.language === 'vi' ? 'contained' : 'outlined'}
                onClick={() => setLang('vi')}
            >
                Tiếng Việt
            </Button>
            <Button
                variant={i18n.language === 'en' ? 'contained' : 'outlined'}
                onClick={() => setLang('en')}
            >
                English
            </Button>
        </Stack>
    );
}
