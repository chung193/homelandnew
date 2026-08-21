import { isLocale, type Locale } from '../../i18n/config';
import SiteTopbar from './SiteTopbar';
import SessionGuard from './SessionGuard';
import SiteFooter from './SiteFooter';

type LocaleLayoutProps = {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
    const { locale } = await params;
    const activeLocale: Locale = isLocale(locale) ? locale : 'vi';

    return (
        <div className="flex min-h-screen flex-col">
            <SiteTopbar locale={activeLocale} />
            <SessionGuard locale={activeLocale} />
            {children}
            <SiteFooter locale={activeLocale} />
        </div>
    );
}
