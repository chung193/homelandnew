import type { Locale } from '../i18n/config';
import { getMessages } from '../i18n/messages';
import { formatRoundedMoney } from './currency';

export function formatPropertyPrice(locale: Locale, price: string | null, unit: string): string {
    const messages = getMessages(locale);
    if (!price) return messages.contact;
    const parsed = Number(price);
    return Number.isFinite(parsed)
        ? `${formatRoundedMoney(parsed, locale)} ${messages.unitDisplay(unit)}`
        : `${price} ${messages.unitDisplay(unit)}`;
}

export function formatPropertyArea(locale: Locale, area: string | null): string {
    if (!area) return getMessages(locale).updating;
    const parsed = Number(area);
    return `${Number.isFinite(parsed) ? parsed.toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN') : area} m²`;
}
