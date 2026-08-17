'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import type { Locale } from '../../i18n/config';
import { getMessages } from '../../i18n/messages';
import { formatPropertyArea, formatPropertyPrice } from '../../lib/propertyDisplay';
import { getCustomerToken } from '../../lib/auth';
import { loadSavedPropertyIds, SAVED_PROPERTIES_CHANGED, toggleSavedProperty } from '../../lib/savedProperties';

export type PropertyCardItem = { id: string; attributes: { title: string; address: string | null; city: string | null; district: string | null; ward: string | null; price: string | null; area: string | null; 'price-unit': string; created_at: string | null } };

function HeartIcon({ filled }: { filled: boolean }) {
    return <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function LocationIcon() {
    return <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" className="shrink-0"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="10" r="2.5" fill="none" stroke="currentColor" strokeWidth="2" /></svg>;
}

function formatPublishedAt(value: string | null | undefined, locale: Locale): string {
    if (!value) return locale === 'vi' ? 'Đang cập nhật' : 'Updating';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return locale === 'vi' ? 'Đang cập nhật' : 'Updating';
    const now = new Date();
    const isToday = date.getFullYear() === now.getFullYear()
        && date.getMonth() === now.getMonth()
        && date.getDate() === now.getDate();
    if (isToday) return locale === 'vi' ? 'hôm nay' : 'today';

    const day = new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
    return day;
}

export default function PropertyCard({ property, locale }: { property: PropertyCardItem; locale: Locale }) {
    const messages = getMessages(locale);
    const attrs = property.attributes;
    const detail = `/${locale}/property/${property.id}`;
    const address = [attrs.address, attrs.ward, attrs.district, attrs.city].filter(Boolean).join(', ');
    const createdAt = attrs.created_at;
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const sync = () => {
            const token = getCustomerToken();
            if (!token) { setSaved(false); return; }
            void loadSavedPropertyIds(token).then((ids) => setSaved(ids.has(property.id))).catch(() => setSaved(false));
        };
        sync();
        window.addEventListener(SAVED_PROPERTIES_CHANGED, sync);
        window.addEventListener('homelend:session-changed', sync);
        return () => { window.removeEventListener(SAVED_PROPERTIES_CHANGED, sync); window.removeEventListener('homelend:session-changed', sync); };
    }, [property.id]);

    async function save() {
        const token = getCustomerToken();
        if (!token) { router.push(`/${locale}/customer/login?redirect=${encodeURIComponent(pathname)}`); return; }
        setSaving(true);
        try { setSaved(await toggleSavedProperty(property.id, token, saved)); } finally { setSaving(false); }
    }

    return <Card variant="default" padding={0} elevation="low" className="relative overflow-hidden">
        <div className="p-4 pr-14">
            <Link href={detail} className="block transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"><Heading level={3}>{attrs.title}</Heading></Link>
            <div className="mt-4 grid gap-2 text-sm">
                <Text><strong>{messages.areaLabel}:</strong> {formatPropertyArea(locale, attrs.area)}</Text>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatPropertyPrice(locale, attrs.price, attrs['price-unit'])}</div>
                <div className="flex items-start gap-1.5" title={messages.locationLabel}>
                    <LocationIcon />
                    <Text type="supporting">{address || messages.updating}</Text>
                </div>
                <time className="text-xs opacity-60" dateTime={createdAt ?? undefined}>{locale === 'vi' ? 'Đăng ' : 'Posted '}{formatPublishedAt(createdAt, locale)}</time>
            </div>
        </div>
        <button type="button" onClick={() => void save()} disabled={saving} className={`absolute right-3 top-3 grid size-10 place-items-center rounded-full border transition disabled:cursor-wait disabled:opacity-60 ${saved ? 'border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-950' : 'hover:border-rose-400 hover:text-rose-500'}`} aria-label={saved ? (locale === 'vi' ? 'Bỏ khỏi tin đã lưu' : 'Remove from saved') : (locale === 'vi' ? 'Đăng nhập để lưu tin' : 'Login to save property')} aria-pressed={saved} title={saved ? (locale === 'vi' ? 'Bỏ lưu' : 'Unsave') : (locale === 'vi' ? 'Lưu tin' : 'Save')}><HeartIcon filled={saved} /></button>
    </Card>;
}
