import type { Locale } from '../i18n/config';

export function roundToThousand(value: number | string | null | undefined): number {
    const amount = Number(value ?? 0);
    return Number.isFinite(amount) ? Math.round(amount / 1000) * 1000 : 0;
}

export function formatRoundedMoney(value: number | string | null | undefined, locale: Locale | string = 'vi'): string {
    const roundedThousands = roundToThousand(value) / 1000;
    const formatted = roundedThousands.toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN');
    return `${formatted} ${locale === 'en' ? 'thousand' : 'nghìn'}`;
}

export function formatVnd(value: number | string | null | undefined, locale: Locale | string = 'vi'): string {
    return `${formatRoundedMoney(value, locale)} ₫`;
}
