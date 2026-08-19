'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@astryxdesign/core/Button';
import { HStack } from '@astryxdesign/core/HStack';
import { type Locale } from '../../i18n/config';
import { getCustomerToken } from '../../lib/auth';

export default function PropertyBookingActions({ locale, propertyId, canRent }: { locale: Locale; propertyId: string; canRent: boolean }) {
    const router = useRouter();
    const vi = locale === 'vi';

    async function open(destination: string) {
        const token=getCustomerToken();
        if (!token) { router.push(`/${locale}/customer/login?redirect=${encodeURIComponent(destination)}`); return; }
        try {
            const response=await fetch('/api/identity-verification',{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});
            const result=await response.json();
            if(response.ok&&result.data?.status==='approved'){router.push(destination);return;}
        } catch {/* Continue to the verification screen. */}
        router.push(`/${locale}/customer/verify-identity?redirect=${encodeURIComponent(destination)}`);
    }

    const viewingUrl = `/${locale}/property/${propertyId}/viewing`;
    const rentUrl = `/${locale}/property/${propertyId}/rent`;

    return <HStack gap={2} wrap="wrap">
        <Button label={vi ? 'Đặt lịch đi xem nhà' : 'Schedule a viewing'} variant="primary" onClick={() => void open(viewingUrl)} />
        {canRent ? <Button label={vi ? 'Đặt lịch thuê' : 'Book this rental'} variant="secondary" onClick={() => void open(rentUrl)} /> : null}
    </HStack>;
}
