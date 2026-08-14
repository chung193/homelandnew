import { notFound } from 'next/navigation';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { isLocale, type Locale } from '../../../../../i18n/config';
import ViewingAppointmentPanel from '../ViewingAppointmentPanel';

const API = process.env.BE_API_URL ?? process.env.NEXT_PUBLIC_BE_API_URL ?? 'http://127.0.0.1:8000/api';

export default async function ViewingPage({ params }: { params: Promise<{locale:string;id:string}> }) {
    const {locale,id}=await params; const activeLocale:Locale=isLocale(locale)?locale:'vi';
    const response=await fetch(`${API}/json-api/properties/${id.replace(/[,.]+$/,'')}`,{cache:'no-store'});
    if(response.status===404)notFound(); if(!response.ok)throw new Error('Failed to load property');
    const property=(await response.json()).data as {id:string;attributes:{title:string;address?:string|null}}|undefined;
    if(!property)notFound(); const vi=activeLocale==='vi';
    return <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 md:px-8 md:py-12"><VStack gap={4}>
        <HStack justify="between" align="center" gap={3} wrap="wrap"><VStack gap={1}><Heading level={2}>{vi?'Đặt lịch đi xem nhà':'Schedule a property viewing'}</Heading><Text type="supporting">{property.attributes.title}{property.attributes.address?` · ${property.attributes.address}`:''}</Text></VStack><Button href={`/${activeLocale}/property/${property.id}`} label={vi?'Quay lại chi tiết':'Back to property'} variant="secondary" /></HStack>
        <Card variant="muted" padding={3}><Text>{vi?'Yêu cầu sẽ được gửi tới chủ nhà để xác nhận khung giờ.':'Your request will be sent to the owner for time confirmation.'}</Text></Card>
        <ViewingAppointmentPanel locale={activeLocale} propertyId={property.id} />
    </VStack></main>;
}
