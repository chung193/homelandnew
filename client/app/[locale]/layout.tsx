import { isLocale, type Locale } from '../../i18n/config';
import SiteTopbar from './SiteTopbar';
import SessionGuard from './SessionGuard';

type LocaleLayoutProps = {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
    const { locale } = await params;
    const activeLocale: Locale = isLocale(locale) ? locale : 'vi';

    return (
        <>
            <SiteTopbar locale={activeLocale} />
            <SessionGuard locale={activeLocale} />
            {children}
        </>
    );
}
