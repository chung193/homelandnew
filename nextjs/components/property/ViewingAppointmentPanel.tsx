'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { type Locale } from '../../i18n/config';
import { getCustomerToken } from '../../lib/auth';

export default function ViewingAppointmentPanel({ locale, propertyId }: { locale: Locale; propertyId: string }) {
    const vi = locale === 'vi';
    const router = useRouter();
    const pathname = usePathname();
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [note, setNote] = useState('');
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const minDate = new Date().toISOString().slice(0, 10);

    async function submit() {
        if (!date || !startTime || !endTime || endTime <= startTime) {
            setFeedback(vi ? 'Vui lòng chọn ngày và khung giờ hợp lệ.' : 'Please choose a valid date and time slot.');
            return;
        }
        const token = getCustomerToken();
        if (!token) {
            router.push(`/${locale}/customer/login?redirect=${encodeURIComponent(`${pathname}?intent=view`)}`);
            return;
        }
        setSubmitting(true); setFeedback('');
        try {
            const response = await fetch('/api/viewing-appointments', {
                method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ property_id: Number(propertyId), appointment_date: date, start_time: startTime, end_time: endTime, note: note.trim() || null }),
            });
            const result = await response.json();
            setFeedback(response.ok ? (vi ? 'Đã gửi yêu cầu. Chủ nhà sẽ xác nhận khung giờ với bạn.' : 'Request sent. The owner will confirm the time slot.') : (result.error ?? (vi ? 'Không thể đặt lịch.' : 'Could not request viewing.')));
            if (response.ok) setNote('');
        } catch { setFeedback(vi ? 'Không thể đặt lịch. Vui lòng thử lại.' : 'Could not request viewing. Please try again.'); }
        finally { setSubmitting(false); }
    }

    return <Card variant="default" padding={4} elevation="low"><VStack gap={3}>
        <Heading level={4}>{vi ? 'Đặt lịch đi xem nhà' : 'Schedule a property viewing'}</Heading>
        <Text type="supporting">{vi ? 'Chọn thời gian phù hợp; chủ nhà sẽ xác nhận hoặc từ chối yêu cầu.' : 'Choose a suitable time; the owner will confirm or decline.'}</Text>
        <label className="flex flex-col gap-1"><Text>{vi ? 'Ngày xem nhà' : 'Viewing date'}</Text><input type="date" min={minDate} value={date} onChange={e => setDate(e.target.value)} className="rounded-lg border border-zinc-300 px-3 py-2" /></label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1"><Text>{vi ? 'Từ' : 'From'}</Text><input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="rounded-lg border border-zinc-300 px-3 py-2" /></label>
            <label className="flex flex-col gap-1"><Text>{vi ? 'Đến' : 'To'}</Text><input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="rounded-lg border border-zinc-300 px-3 py-2" /></label>
        </div>
        <label className="flex flex-col gap-1"><Text>{vi ? 'Ghi chú cho chủ nhà' : 'Note to owner'}</Text><textarea rows={3} maxLength={2000} value={note} onChange={e => setNote(e.target.value)} className="rounded-lg border border-zinc-300 px-3 py-2" /></label>
        <Button label={vi ? 'Gửi yêu cầu xem nhà' : 'Request viewing'} variant="primary" onClick={() => void submit()} isLoading={submitting} />
        {feedback ? <Text>{feedback}</Text> : null}
    </VStack></Card>;
}
