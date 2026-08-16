import Link from 'next/link';
import Image from 'next/image';
import {Suspense} from 'react';
import type { Locale } from '../../i18n/config';
import { getMessages } from '../../i18n/messages';
import AccountMenu from './AccountMenu';
import LocaleSwitchButton from './LocaleSwitchButton';
import ThemeModeToggle from './ThemeModeToggle';
import PostPropertyNavAction from './PostPropertyNavAction';
import PropertyCategoryMenu from './PropertyCategoryMenu';

export default function SiteTopbar({ locale }: { locale: Locale }) {
    const messages = getMessages(locale);
    const vi = locale === 'vi';

    return (
        <header className="topbar-shell sticky inset-x-0 top-0 z-50 border-b backdrop-blur">
            <nav
                className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2 overflow-visible px-4 py-3 md:px-8"
                aria-label={vi ? 'Điều hướng chính' : 'Main navigation'}
            >
                <Link href={`/${locale}`} className="topbar-link shrink-0 rounded-lg px-2 py-1" aria-label="Homelend">
                    <Image src="/logo.png" alt="Homelend" width={144} height={36} priority className="h-9 w-auto max-w-36 object-contain"/>
                </Link>
                <Suspense fallback={null}>
                    <PropertyCategoryMenu locale={locale} />
                </Suspense>
                <Link href={`/${locale}/blog`} className="topbar-link shrink-0 rounded-lg px-3 py-2 text-sm font-medium">
                    Blog
                </Link>
                <Link href={`/${locale}/wallet`} className="topbar-link shrink-0 rounded-lg px-3 py-2 text-sm font-medium">
                    {vi ? 'Nạp tiền' : 'Wallet'}
                </Link>
                <PostPropertyNavAction locale={locale} />
                <Link href={`/${locale}/owner/bookings`} className="topbar-link shrink-0 rounded-lg px-3 py-2 text-sm font-medium">
                    {messages.ownerBookingsOpenAction}
                </Link>
                <Link href={`/${locale}/owner/viewing-appointments`} className="topbar-link shrink-0 rounded-lg px-3 py-2 text-sm font-medium">
                    {vi ? 'Lịch xem nhà' : 'Viewing requests'}
                </Link>
                <LocaleSwitchButton currentLocale={locale} />
                <ThemeModeToggle labels={{system:messages.themeSystem,light:messages.themeLight,dark:messages.themeDark,night:messages.themeNight}} />
                <AccountMenu locale={locale} />
            </nav>
        </header>
    );
}
