'use client';

import { useSearchParams } from 'next/navigation';
import type { Locale } from '../../i18n/config';

type LocaleSwitchButtonProps = {
    currentLocale: Locale;
};

export default function LocaleSwitchButton({ currentLocale }: LocaleSwitchButtonProps) {
    const searchParams = useSearchParams();

    return (
        <label className="inline-flex items-center">
            <span className="sr-only">Language</span>
            <select
                value={currentLocale}
                onChange={(event) => {
                    const selectedLocale = event.target.value as Locale;
                    const params = new URLSearchParams(searchParams.toString());
                    if (!params.get('page')) {
                        params.set('page', '1');
                    }

                    sessionStorage.setItem('homelend:scrollY', String(window.scrollY));

                    const query = params.toString();
                    const targetUrl = query ? `/${selectedLocale}?${query}` : `/${selectedLocale}`;
                    window.location.assign(targetUrl);
                }}
                className="topbar-select select-soft h-9 border px-2 text-sm shadow-sm outline-none transition"
                aria-label="Language selector"
            >
                <option value="vi">🇻🇳 Tiếng Việt</option>
                <option value="en">🇬🇧 English</option>
            </select>
        </label>
    );
}
