'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { getMessages } from '../../../../i18n/messages';
import { isLocale, type Locale } from '../../../../i18n/config';
import { getCustomerToken } from '../../../../lib/auth';
import OwnerBookingCard from './OwnerBookingCard';
import type {OwnerBooking,OwnerBookingAction,OwnerBookingsResponse} from '../../../../features/booking/types';

export default function OwnerBookingsClient() {
    const router = useRouter();
    const params = useParams<{ locale: string }>();
    const locale = useMemo<Locale>(() => (isLocale(params.locale) ? params.locale : 'vi'), [params.locale]);
    const messages = getMessages(locale);
    const [bookings, setBookings] = useState<OwnerBooking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [feedback, setFeedback] = useState('');
    const [busyIds, setBusyIds] = useState<Record<number, boolean>>({});

    const loginUrl = `/${locale}/customer/login?redirect=${encodeURIComponent(`/${locale}/owner/bookings`)}`;

    const loadBookings = useCallback(async () => {
        const token = getCustomerToken();
        if (!token) {
            router.replace(loginUrl);
            return;
        }

        try {
            const response = await fetch('/api/owner/bookings', {
                headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
                cache: 'no-store',
            });
            const result: OwnerBookingsResponse = await response.json();

            if (!response.ok) {
                setFeedback(result.error ?? messages.ownerActionFailed);
                setBookings([]);
                return;
            }

            setBookings(Array.isArray(result.data) ? result.data : []);
        } catch {
            setFeedback(messages.ownerActionFailed);
            setBookings([]);
        } finally {
            setIsLoading(false);
        }
    }, [loginUrl, messages.ownerActionFailed, router]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => void loadBookings(), 0);
        return () => window.clearTimeout(timeoutId);
    }, [loadBookings]);

    async function updateStatus(id: number, action: OwnerBookingAction) {
        const token = getCustomerToken();
        if (!token) {
            router.replace(loginUrl);
            return;
        }

        setBusyIds((previous) => ({ ...previous, [id]: true }));
        setFeedback('');

        try {
            const response = await fetch(action === 'approve' || action === 'reject' ? `/api/owner/bookings/${id}/${action}` : `/api/bookings/${id}/${action}`, {
                method: 'PATCH',
                headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
                cache: 'no-store',
            });
            const result = await response.json();

            if (!response.ok) {
                setFeedback(response.status === 403 ? messages.ownerForbidden : result.error ?? messages.ownerActionFailed);
                return;
            }

            setFeedback(messages.ownerActionSuccess);
            await loadBookings();
        } catch {
            setFeedback(messages.ownerActionFailed);
        } finally {
            setBusyIds((previous) => ({ ...previous, [id]: false }));
        }
    }

    return (
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 md:px-8 md:py-12">
            <VStack gap={4}>
                <VStack gap={1}>
                    <Heading level={2}>{messages.ownerBookingsTitle}</Heading>
                    <Text type="supporting">{messages.ownerBookingsSubtitle}</Text>
                </VStack>

                <Card variant="muted" padding={3}>
                    <Text type="supporting">{messages.ownerBookingsPendingOnlyHint}</Text>
                </Card>

                {feedback ? <Card variant="default" padding={3}><Text>{feedback}</Text></Card> : null}
                {isLoading ? <Card variant="muted" padding={4}><Text>{messages.loadingMore}</Text></Card> : null}
                {!isLoading && bookings.length === 0 ? (
                    <Card variant="muted" padding={4}><Text>{messages.ownerBookingsEmpty}</Text></Card>
                ) : null}

                {!isLoading ? bookings.map((booking)=><OwnerBookingCard key={booking.id} booking={booking} locale={locale} busy={Boolean(busyIds[booking.id])} onAction={(id,action)=>void updateStatus(id,action)}/>) : null}
            </VStack>
        </main>
    );
}
