'use client';

import { useEffect, useRef, useState } from 'react';
import type { Locale } from '../../i18n/config';

export default function PropertyViewCount({ propertyId, initialViews, locale }: { propertyId: string; initialViews: number; locale: Locale }) {
    const [views, setViews] = useState(initialViews);
    const recorded = useRef(false);

    useEffect(() => {
        if (recorded.current) return;
        recorded.current = true;
        void fetch(`/api/properties/${propertyId}/view`, { method: 'POST' })
            .then((response) => response.ok ? response.json() : null)
            .then((result) => { if (typeof result?.data?.views === 'number') setViews(result.data.views); })
            .catch(() => undefined);
    }, [propertyId]);

    return <div className="min-w-28">
        <span className="block text-sm leading-5 text-zinc-500 dark:text-zinc-400">{locale === 'vi' ? 'Lượt xem' : 'Views'}</span>
        <strong className="mt-1 block text-lg font-semibold leading-6 text-foreground">{views.toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')}</strong>
    </div>;
}
