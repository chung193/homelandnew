import { notFound, redirect } from 'next/navigation';
import { Button } from '@astryxdesign/core/Button';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { isLocale, type Locale } from '../../../../../i18n/config';
import BookingPanel from '../../../../../components/property/BookingPanel';

type Attributes={title:string;'listing-type':string;price:string|null;'price-unit':string;'long-term-months'?:number|null;'long-term-price'?:string|null;'deposit-amount'?:string|null};
const API = process.env.BE_API_URL ?? process.env.NEXT_PUBLIC_BE_API_URL ?? 'http://127.0.0.1:8000/api';

export default async function RentPage({params}:{params:Promise<{locale:string;id:string}>}){
    const {locale,id}=await params;const activeLocale:Locale=isLocale(locale)?locale:'vi';
    const response=await fetch(`${API}/json-api/properties/${id.replace(/[,.]+$/,'')}`,{cache:'no-store'});
    if(response.status===404)notFound();if(!response.ok)throw new Error('Failed to load property');
    const property=(await response.json()).data as {id:string;attributes:Attributes}|undefined;if(!property)notFound();
    if(property.attributes['listing-type']!=='rent')redirect(`/${activeLocale}/property/${property.id}`);
    const attrs=property.attributes;const vi=activeLocale==='vi';
    return <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 md:px-8 md:py-12"><VStack gap={4}>
        <HStack justify="between" align="center" gap={3} wrap="wrap"><VStack gap={1}><Heading level={2}>{vi?'Đặt lịch thuê bất động sản':'Book this rental'}</Heading><Text type="supporting">{attrs.title}</Text></VStack><Button href={`/${activeLocale}/property/${property.id}`} label={vi?'Quay lại chi tiết':'Back to property'} variant="secondary" /></HStack>
        <BookingPanel locale={activeLocale} propertyId={property.id} listingType={attrs['listing-type']} unitPrice={attrs.price} priceUnit={attrs['price-unit']} longTermMonths={attrs['long-term-months']??null} longTermPrice={attrs['long-term-price']??null} depositAmount={attrs['deposit-amount']??null}/>
    </VStack></main>;
}
