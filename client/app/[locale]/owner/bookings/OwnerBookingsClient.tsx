'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { getMessages } from '../../../../i18n/messages';
import { isLocale, type Locale } from '../../../../i18n/config';
import { getCustomerToken } from '../../../../lib/auth';
import {statusLabel} from '../../../../lib/displayLabels';

type BookingItem = {
    id: number;
    property_id: number;
    customer_id: number;
    start_date: string;
    end_date: string;
    nights: number;
    total_price: string;
    deposit_amount: string;
    payable_total: string;
    status: 'pending' | 'confirmed' | 'in_progress' | 'cancelled' | 'rejected' | 'completed';
    note?: string | null;
    property?: { id?: number; title?: string };
    customer?: { name?: string; email?: string; phone?: string };
};

type OwnerBookingsResponse = {
    data?: BookingItem[];
    error?: string;
};

function statusVariant(status: BookingItem['status']): 'info' | 'success' | 'warning' | 'error' {
    if (status === 'confirmed') return 'success';
    if (status === 'completed') return 'success';
    if (status === 'pending') return 'warning';
    if (status === 'cancelled' || status === 'rejected') return 'error';
    return 'info';
}

export default function OwnerBookingsClient() {
    const router = useRouter();
    const params = useParams<{ locale: string }>();
    const locale = useMemo<Locale>(() => (isLocale(params.locale) ? params.locale : 'vi'), [params.locale]);
    const messages = getMessages(locale);
    const [bookings, setBookings] = useState<BookingItem[]>([]);
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

    async function updateStatus(id: number, action: 'approve' | 'reject' | 'start' | 'complete') {
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

                {!isLoading ? bookings.map((booking) => (
                    <Card key={booking.id} variant="default" padding={4} elevation="low">
                        <VStack gap={2}>
                            <HStack justify="between" align="center" gap={2} wrap="wrap">
                                <Heading level={4}>{booking.property?.title ?? 'Bất động sản'}</Heading>
                                <Badge variant={statusVariant(booking.status)} label={statusLabel(booking.status,locale)} />
                            </HStack>
                            <Text><strong>{messages.bookingCustomerLabel}:</strong> {booking.customer?.name ?? 'Khách thuê'}</Text>
                            {booking.customer ? <Card variant="muted" padding={3}><VStack gap={1}><Text><strong>Liên hệ khách thuê:</strong> {booking.customer.phone || 'Chưa có SĐT'}</Text><Text>{booking.customer.email}</Text></VStack></Card> : null}
                            <Text><strong>{messages.bookingStartDateLabel}:</strong> {booking.start_date}</Text>
                            <Text><strong>{messages.bookingEndDateLabel}:</strong> {booking.end_date}</Text>
                            <Text><strong>{messages.bookingNightsLabel}:</strong> {booking.nights}</Text>
                            <Text><strong>{messages.bookingTotalLabel}:</strong> {booking.total_price}</Text>
                            <Text><strong>Tiền đặt cọc:</strong> {Number(booking.deposit_amount).toLocaleString('vi-VN')} ₫</Text>
                            <Text><strong>Tổng dự kiến:</strong> {Number(booking.payable_total).toLocaleString('vi-VN')} ₫</Text>
                            {booking.note ? <Text><strong>{messages.bookingNoteLabel}:</strong> {booking.note}</Text> : null}
                            <HStack gap={2} wrap="wrap">
                                <Button
                                    label={messages.ownerApproveAction}
                                    variant="primary"
                                    isDisabled={booking.status !== 'pending'}
                                    isLoading={Boolean(busyIds[booking.id])}
                                    onClick={() => void updateStatus(booking.id, 'approve')}
                                />
                                {booking.status === 'confirmed' ? <Button label="Đã bàn giao" variant="primary" isLoading={Boolean(busyIds[booking.id])} onClick={() => void updateStatus(booking.id, 'start')} /> : null}
                                {booking.status === 'in_progress' ? <Button label="Xác nhận hoàn thành" variant="primary" isLoading={Boolean(busyIds[booking.id])} onClick={() => void updateStatus(booking.id, 'complete')} /> : null}
                                <Button
                                    label={messages.ownerRejectAction}
                                    variant="secondary"
                                    isDisabled={booking.status !== 'pending'}
                                    isLoading={Boolean(busyIds[booking.id])}
                                    onClick={() => void updateStatus(booking.id, 'reject')}
                                />
                            </HStack>
                        </VStack>
                    </Card>
                )) : null}
            </VStack>
        </main>
    );
}
