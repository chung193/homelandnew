'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { PropertyCardItem } from './PropertyCard';
import { getCustomerToken } from '../../lib/auth';
import { loadSavedPropertyIds, SAVED_PROPERTIES_CHANGED, toggleSavedProperty } from '../../lib/savedProperties';

export default function PropertyDetailActions({ property, locale }: { property: PropertyCardItem; locale: 'vi' | 'en' }) {
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

    async function share() {
        if (navigator.share) await navigator.share({ title: property.attributes.title, url: window.location.href });
        else await navigator.clipboard.writeText(window.location.href);
    }

    async function save() {
        const token = getCustomerToken();
        if (!token) { router.push(`/${locale}/customer/login?redirect=${encodeURIComponent(pathname)}`); return; }
        setSaving(true);
        try { setSaved(await toggleSavedProperty(property.id, token, saved)); } finally { setSaving(false); }
    }

    return <div className="flex items-center gap-2">
        <button type="button" onClick={() => void share()} className="grid size-10 place-items-center rounded-full border transition hover:border-emerald-500" aria-label={locale === 'vi' ? 'Chia sẻ tin' : 'Share'} title={locale === 'vi' ? 'Chia sẻ' : 'Share'}>↗</button>
        <button type="button" onClick={() => void save()} disabled={saving} className={`grid size-10 place-items-center rounded-full border text-xl transition disabled:cursor-wait disabled:opacity-60 ${saved ? 'border-rose-500 bg-rose-50 text-rose-600' : 'hover:border-rose-500 hover:text-rose-500'}`} aria-pressed={saved} aria-label={locale === 'vi' ? 'Lưu tin' : 'Save'}>{saved ? '♥' : '♡'}</button>
    </div>;
}
