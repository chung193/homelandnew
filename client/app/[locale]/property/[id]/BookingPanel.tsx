'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { type Locale } from '../../../../i18n/config';
import { getMessages } from '../../../../i18n/messages';
import { getCustomerToken } from '../../../../lib/auth';

type BookingPanelProps = {
    locale: Locale;
    propertyId: string;
    listingType: string;
    unitPrice: string | null;
    priceUnit: string;
    longTermMonths: number | null;
    longTermPrice: string | null;
    depositAmount: string | null;
};

type AvailabilityResponse = {
    data?: {
        available?: boolean | null;
        nights?: number | null;
    };
    error?: string;
};

type BookingCreateResponse = {
    data?: {
        id?: number;
    };
    error?: string;
};

function toDisplayPrice(locale: Locale, amount: number): string {
    return amount.toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN');
}

function addCalendarMonths(value:string,months:number):string{if(!value)return'';const [year,month,day]=value.split('-').map(Number);const target=new Date(Date.UTC(year,month-1+months,1));const lastDay=new Date(Date.UTC(target.getUTCFullYear(),target.getUTCMonth()+1,0)).getUTCDate();target.setUTCDate(Math.min(day,lastDay));return target.toISOString().slice(0,10)}
function daysBetween(start:string,end:string):number|null{if(!start||!end)return null;const value=(Date.parse(`${end}T00:00:00Z`)-Date.parse(`${start}T00:00:00Z`))/86400000;return value>0?value:null}
function normalizePriceUnit(value:string):'month'|'day'|'night'{const unit=value.trim().toLowerCase();if(['month','months','monthly','tháng','thang'].includes(unit))return'month';if(['day','days','daily','ngày','ngay'].includes(unit))return'day';return'night'}

export default function BookingPanel({ locale, propertyId, listingType, unitPrice, priceUnit, longTermMonths, longTermPrice, depositAmount }: BookingPanelProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const messages = getMessages(locale);
    const billingUnit=normalizePriceUnit(priceUnit);

    const [startDate, setStartDate] = useState(searchParams.get('start_date') ?? '');
    const [endDate, setEndDate] = useState(searchParams.get('end_date') ?? '');
    const [note, setNote] = useState('');
    const [nights, setNights] = useState<number | null>(null);
    const [availability, setAvailability] = useState<boolean | null>(null);
    const [feedback, setFeedback] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rentalMonths,setRentalMonths]=useState(1);

    const parsedUnitPrice = useMemo(() => {
        if (!unitPrice) {
            return null;
        }

        const parsed = Number(unitPrice);
        return Number.isFinite(parsed) ? parsed : null;
    }, [unitPrice]);

    const pricing = useMemo(() => {
        if (parsedUnitPrice === null || nights === null) {
            return null;
        }
        const units=billingUnit==='month'?rentalMonths:nights;
        const promotionalPrice=longTermPrice===null?null:Number(longTermPrice);
        const usesLongTerm=billingUnit==='month'&&longTermMonths!==null&&promotionalPrice!==null&&Number.isFinite(promotionalPrice)&&units>=longTermMonths;
        const appliedPrice=usesLongTerm?promotionalPrice:parsedUnitPrice;
        const rentTotal=appliedPrice*units;const deposit=depositAmount===null?0:Number(depositAmount)||0;
        return {units,usesLongTerm,appliedPrice,rentTotal,deposit,payableTotal:rentTotal+deposit};
    }, [billingUnit, depositAmount, longTermMonths, longTermPrice, nights, parsedUnitPrice, rentalMonths]);

    async function checkAvailability() {
        if (!startDate || !endDate) {
            setFeedback(messages.bookingPickDates);
            setAvailability(null);
            setNights(null);
            return;
        }

        setIsChecking(true);
        setFeedback('');

        try {
            const params = new URLSearchParams({
                start_date: startDate,
                end_date: endDate,
            });

            const response = await fetch(`/api/properties/${propertyId}/availability?${params.toString()}`, {
                cache: 'no-store',
            });

            const result: AvailabilityResponse = await response.json();

            if (!response.ok) {
                setAvailability(null);
                setNights(null);
                setFeedback(result.error ?? messages.bookingFailed);
                return;
            }

            setAvailability(Boolean(result.data?.available));
            setNights(typeof result.data?.nights === 'number' ? result.data.nights : null);
            setFeedback(result.data?.available ? messages.bookingAvailabilityReady : messages.bookingAvailabilityTaken);
        } catch {
            setAvailability(null);
            setNights(null);
            setFeedback(messages.bookingFailed);
        } finally {
            setIsChecking(false);
        }
    }

    async function submitBooking() {
        if (!startDate || !endDate) {
            setFeedback(messages.bookingPickDates);
            return;
        }

        const token = getCustomerToken();

        if (!token) {
            const redirectParams = new URLSearchParams(searchParams.toString());
            redirectParams.set('intent', 'book');
            redirectParams.set('start_date', startDate);
            redirectParams.set('end_date', endDate);
            const redirect = `${pathname}?${redirectParams.toString()}`;
            router.push(`/${locale}/customer/login?redirect=${encodeURIComponent(redirect)}`);
            return;
        }

        setIsSubmitting(true);
        setFeedback('');

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    property_id: Number(propertyId),
                    start_date: startDate,
                    end_date: endDate,
                    note: note.trim() || null,
                }),
            });

            const result: BookingCreateResponse = await response.json();

            if (!response.ok) {
                setFeedback(result.error ?? messages.bookingFailed);
                return;
            }

            setFeedback(messages.bookingSuccess);
            setAvailability(true);
        } catch {
            setFeedback(messages.bookingFailed);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card variant="default" padding={4} elevation="low">
            <VStack gap={3}>
                <Heading level={4}>{messages.bookingSectionTitle}</Heading>

                {listingType !== 'rent' ? (
                    <Text type="supporting">{messages.bookingOnlyForRent}</Text>
                ) : (
                    <>
                        <Card variant="muted" padding={3}><VStack gap={1}><Text><strong>Giá thuê tiêu chuẩn:</strong> {parsedUnitPrice===null?'Liên hệ':`${toDisplayPrice(locale,parsedUnitPrice)} VND/${priceUnit}`}</Text>{longTermMonths&&longTermPrice?<Text><strong>Giá thuê dài hạn:</strong> {toDisplayPrice(locale,Number(longTermPrice))} VND/tháng khi thuê từ {longTermMonths} tháng</Text>:<Text type="supporting">Chủ nhà chưa thiết lập giá ưu đãi dài hạn.</Text>}<Text><strong>Tiền đặt cọc:</strong> {toDisplayPrice(locale,Number(depositAmount)||0)} VND</Text></VStack></Card>
                        <label className="flex flex-col gap-1">
                            <Text>{messages.bookingStartDateLabel}</Text>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(event) => {const value=event.target.value;setStartDate(value);if(billingUnit==='month'){const end=addCalendarMonths(value,rentalMonths);setEndDate(end);setNights(daysBetween(value,end))}else setNights(daysBetween(value,endDate));setAvailability(null)}}
                                className="rounded-lg border border-zinc-300 px-3 py-2"
                            />
                        </label>

                        {billingUnit==='month'?<label className="flex flex-col gap-1"><Text>Số tháng muốn thuê</Text><select value={rentalMonths} onChange={(event)=>{const months=Number(event.target.value);setRentalMonths(months);const end=addCalendarMonths(startDate,months);setEndDate(end);setNights(daysBetween(startDate,end));setAvailability(null)}} className="rounded-lg border border-zinc-300 px-3 py-2">{Array.from({length:36},(_,index)=>index+1).map(month=><option key={month} value={month}>{month} tháng{longTermMonths&&month>=longTermMonths?' · giá ưu đãi':''}</option>)}</select></label>:null}

                        <label className="flex flex-col gap-1">
                            <Text>{messages.bookingEndDateLabel}</Text>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(event) => {setEndDate(event.target.value);setNights(daysBetween(startDate,event.target.value));setAvailability(null)}}
                                readOnly={billingUnit==='month'}
                                className="rounded-lg border border-zinc-300 px-3 py-2"
                            />
                        </label>

                        <label className="flex flex-col gap-1">
                            <Text>{messages.bookingNoteLabel}</Text>
                            <textarea
                                value={note}
                                onChange={(event) => setNote(event.target.value)}
                                rows={3}
                                className="rounded-lg border border-zinc-300 px-3 py-2"
                            />
                        </label>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                label={messages.bookingCheckAvailability}
                                variant="secondary"
                                onClick={() => void checkAvailability()}
                                isLoading={isChecking}
                            />
                            <Button
                                label={messages.bookingSubmitAction}
                                variant="primary"
                                onClick={() => void submitBooking()}
                                isLoading={isSubmitting}
                            />
                        </div>

                        {nights !== null ? (
                            <Text>
                                <strong>{messages.bookingNightsLabel}:</strong> {nights}
                            </Text>
                        ) : null}

                        {pricing ? <Card variant="muted" padding={3}><VStack gap={1}><Text><strong>Đơn giá áp dụng:</strong> {toDisplayPrice(locale,pricing.appliedPrice)} VND/{billingUnit==='month'?'tháng':billingUnit==='day'?'ngày':'đêm'}{pricing.usesLongTerm?' (ưu đãi dài hạn)':''}</Text><Text><strong>Số kỳ tính tiền:</strong> {pricing.units} {billingUnit==='month'?'tháng':billingUnit==='day'?'ngày':'đêm'}</Text><Text><strong>Tiền thuê:</strong> {toDisplayPrice(locale,pricing.rentTotal)} VND</Text><Text><strong>Đặt cọc:</strong> {toDisplayPrice(locale,pricing.deposit)} VND</Text><Text><strong>{messages.bookingTotalLabel}:</strong> {toDisplayPrice(locale,pricing.payableTotal)} VND</Text></VStack></Card> : null}

                        {availability !== null ? (
                            <Text type="supporting">
                                {availability ? messages.bookingAvailabilityReady : messages.bookingAvailabilityTaken}
                            </Text>
                        ) : null}

                        {feedback ? <Text>{feedback}</Text> : null}
                    </>
                )}
            </VStack>
        </Card>
    );
}
