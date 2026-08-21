import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import { Badge } from '@astryxdesign/core/Badge';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import PropertyGallery from './PropertyGallery';
import PropertyViewCount from './PropertyViewCount';
import PropertyBookingActions from './PropertyBookingActions';
import PropertyContactCard from './PropertyContactCard';
import PropertyDetailActions from './PropertyDetailActions';
import PropertyCard, { type PropertyCardItem } from '../../PropertyCard';
import ReviewPanel from './ReviewPanel';
import { getMessages } from '../../../../i18n/messages';
import { isLocale, type Locale } from '../../../../i18n/config';
import { formatPropertyArea, formatPropertyPrice } from '../../../../lib/propertyDisplay';

type PropertyAttributes = {
    title: string; description: string | null; address: string | null; 'address-detail'?: string | null;
    city: string | null; district: string | null; ward: string | null; latitude?: string | null; longitude?: string | null;
    price: string | null; area: string | null; status: string; 'listing-type': string; 'price-unit': string;
    bedrooms?: number | null; bathrooms?: number | null; floor?: number | null; 'legal-info'?: string | null;
    'long-term-months'?: number | null; 'long-term-price'?: string | null; 'deposit-amount'?: string | null;
    'featured-image'?: string | null; 'view-count'?: number; created_at: string | null;
};

type IncludedEntry = { id: string; type: string; attributes?: { name?: string | null; icon?: string | null; description?: string | null; url?: string | null; 'preview-url'?: string | null; avatar?: string | null; phone?: string | null } };
type Relationship = { data?: Array<{ id: string; type: string }> };
type PropertyDetailResponse = { data?: { id: string; attributes: PropertyAttributes; relationships?: { amenities?: Relationship; images?: Relationship; owner?: { data?: { id: string; type: string } | null } } }; included?: IncludedEntry[] };
type PageProps = { params: Promise<{ locale: string; id: string }> };

const API_BASE_URL = process.env.BE_API_URL ?? process.env.NEXT_PUBLIC_BE_API_URL ?? 'http://127.0.0.1:8000/api';
export const dynamic = 'force-dynamic';

async function getPropertyDetail(id: string): Promise<PropertyDetailResponse> {
    const response = await fetch(`${API_BASE_URL}/json-api/properties/${id}`, { cache: 'no-store' });
    if (response.status === 404) return {};
    if (!response.ok) throw new Error('Failed to load property detail.');
    return response.json();
}

async function getRelatedProperties(city: string | null, currentId: string): Promise<PropertyCardItem[]> {
    if (!city) return [];
    const response = await fetch(`${API_BASE_URL}/json-api/properties?city=${encodeURIComponent(city)}`, { cache: 'no-store' });
    if (!response.ok) return [];
    const payload = await response.json() as { data?: PropertyCardItem[] };
    return (payload.data ?? []).filter((item) => item.id !== currentId);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale, id } = await params;
    const activeLocale: Locale = isLocale(locale) ? locale : 'vi';
    const messages = getMessages(activeLocale);
    try {
        const title = (await getPropertyDetail(id.replace(/[,.]+$/, ''))).data?.attributes.title;
        return { title: title ? `${title} | Homelend` : messages.propertyDetailTitle, description: messages.siteDescription };
    } catch { return { title: messages.propertyDetailTitle, description: messages.siteDescription }; }
}

function dateLabel(value: string | null, locale: Locale) {
    if (!value) return locale === 'vi' ? 'Đang cập nhật' : 'Updating';
    return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
}

function LocationIcon() {
    return <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className="mt-0.5 shrink-0 text-emerald-600"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="10" r="2.5" fill="none" stroke="currentColor" strokeWidth="2" /></svg>;
}

export default async function PropertyDetailPage({ params }: PageProps) {
    const { locale, id } = await params;
    const activeLocale: Locale = isLocale(locale) ? locale : 'vi';
    const vi = activeLocale === 'vi';
    const messages = getMessages(activeLocale);
    const payload = await getPropertyDetail(id.replace(/[,.]+$/, ''));
    const property = payload.data;
    if (!property) notFound();

    const attrs = property.attributes;
    const included = payload.included ?? [];
    const fullAddress = [attrs['address-detail'], attrs.address, attrs.ward, attrs.district, attrs.city].filter(Boolean).join(', ');
    const mapLocation = [attrs.ward, attrs.district, attrs.city].filter(Boolean).join(', ');
    const includedByKey = new Map(included.map((entry) => [`${entry.type}:${entry.id}`, entry]));
    const images = (property.relationships?.images?.data ?? []).map((entry) => {
        const item = includedByKey.get(`${entry.type}:${entry.id}`);
        return { id: entry.id, url: item?.attributes?.url ?? item?.attributes?.['preview-url'] ?? null };
    }).filter((image) => image.url);
    const imageUrls = [...(attrs['featured-image'] ? [{ id: 'featured', url: attrs['featured-image'] }] : []), ...images]
        .filter((item, index, list) => list.findIndex((candidate) => candidate.url === item.url) === index);
    const amenities = (property.relationships?.amenities?.data ?? []).map((entry) => includedByKey.get(`${entry.type}:${entry.id}`)).filter(Boolean) as IncludedEntry[];
    const ownerRelation = property.relationships?.owner?.data;
    const owner = ownerRelation ? includedByKey.get(`${ownerRelation.type}:${ownerRelation.id}`)?.attributes : undefined;
    const publicSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
    const propertyUrl = `${publicSiteUrl}/${activeLocale}/property/${property.id}`;
    const qrDataUrl = await QRCode.toDataURL(propertyUrl, { width: 180, margin: 1, errorCorrectionLevel: 'M' });
    const relatedProperties = (await getRelatedProperties(attrs.city, property.id))
        .sort((left, right) => {
            const leftWard = left.attributes.ward === attrs.ward ? 1 : 0;
            const rightWard = right.attributes.ward === attrs.ward ? 1 : 0;
            const leftDistrict = left.attributes.district === attrs.district ? 1 : 0;
            const rightDistrict = right.attributes.district === attrs.district ? 1 : 0;
            return (rightWard * 2 + rightDistrict) - (leftWard * 2 + leftDistrict);
        })
        .slice(0, 6);
    const characteristics = [
        [messages.areaLabel, formatPropertyArea(activeLocale, attrs.area)],
        [vi ? 'Phòng ngủ' : 'Bedrooms', attrs.bedrooms],
        [vi ? 'Phòng tắm' : 'Bathrooms', attrs.bathrooms],
        [vi ? 'Tầng' : 'Floor', attrs.floor],
        [vi ? 'Pháp lý' : 'Legal information', attrs['legal-info']],
    ].filter(([, value]) => value !== null && value !== undefined && value !== '');

    return <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-10">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-sm opacity-70"><Link href={`/${activeLocale}`} className="hover:text-emerald-600">{vi ? 'Trang chủ' : 'Home'}</Link><span>/</span><span>{attrs['listing-type'] === 'rent' ? messages.listingRent : messages.listingSale}</span><span>/</span><span>{attrs.city || messages.updating}</span></div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="min-w-0 space-y-6">
                {imageUrls.length ? <PropertyGallery images={imageUrls} title={attrs.title} /> : <div className="grid h-80 place-items-center rounded-2xl bg-zinc-100 dark:bg-zinc-900"><Text type="supporting">{messages.updating}</Text></div>}

                <section className="border-b pb-6">
                    <div className="flex items-start justify-between gap-4 py-3 sm:py-5"><div className="min-w-0"><div className="mb-3"><Badge variant={attrs['listing-type'] === 'sale' ? 'success' : 'warning'} label={attrs['listing-type'] === 'sale' ? messages.listingSale : messages.listingRent} /></div><h1 className="max-w-3xl text-pretty text-2xl font-bold leading-tight text-foreground sm:text-3xl">{attrs.title}</h1></div><PropertyDetailActions property={property} locale={activeLocale} /></div>
                    <div className="mt-3 flex items-start gap-2 text-sm"><LocationIcon /><Text type="supporting">{fullAddress || messages.updating}</Text></div>
                    <div className="mt-5 flex flex-wrap items-end gap-x-12 gap-y-3 border-t pt-5">
                        <div><Text type="supporting">{messages.priceLabel}</Text><div className="text-xl font-bold text-emerald-600">{formatPropertyPrice(activeLocale, attrs.price, attrs['price-unit'])}</div></div>
                        <div className="min-w-28"><span className="block text-sm leading-5 text-zinc-500 dark:text-zinc-400">{messages.areaLabel}</span><strong className="mt-1 block text-lg font-semibold leading-6 text-foreground">{formatPropertyArea(activeLocale, attrs.area)}</strong></div>
                        <PropertyViewCount propertyId={property.id} initialViews={attrs['view-count'] ?? 0} locale={activeLocale} />
                    </div>
                </section>

                <section className="border-b pb-6"><Heading level={3}>{vi ? 'Thông tin mô tả' : 'Description'}</Heading>{attrs.description ? <div className="property-description mt-4 whitespace-pre-line leading-7" dangerouslySetInnerHTML={{ __html: attrs.description }} /> : <Text type="supporting">{messages.noDescription}</Text>}</section>

                <section><Heading level={3}>{vi ? 'Đặc điểm bất động sản' : 'Property features'}</Heading><div className="mt-4 grid gap-x-8 sm:grid-cols-2">{characteristics.map(([label, value]) => <div key={String(label)} className="flex justify-between gap-4 border-b py-4"><strong>{label}</strong><span className="text-right">{value}</span></div>)}</div></section>

                {amenities.length ? <section><Heading level={3}>{messages.amenitiesTitle}</Heading><div className="mt-4 flex flex-wrap gap-2">{amenities.map((amenity) => <Badge key={amenity.id} variant="info" label={`${amenity.attributes?.icon ?? ''} ${amenity.attributes?.name ?? amenity.id}`.trim()} />)}</div></section> : null}

                {mapLocation ? <section>
                    <div className="flex flex-wrap items-center justify-between gap-3"><Heading level={3}>{vi ? 'Vị trí trên bản đồ' : 'Location on map'}</Heading><a href={`https://www.google.com/maps?q=${encodeURIComponent(mapLocation)}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-emerald-600 hover:underline">{vi ? 'Mở Google Maps ↗' : 'Open Google Maps ↗'}</a></div>
                    <div className="mt-4 overflow-hidden rounded-2xl border bg-zinc-100 shadow-sm dark:bg-zinc-900">
                        <iframe
                            src={`https://www.google.com/maps?q=${encodeURIComponent(mapLocation)}&z=14&output=embed`}
                            title={vi ? `Bản đồ vị trí ${attrs.title}` : `Map location of ${attrs.title}`}
                            className="h-80 w-full border-0 sm:h-96"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            allowFullScreen
                        />
                    </div>
                    <div className="mt-3 flex items-start gap-2 text-sm"><LocationIcon /><Text type="supporting">{mapLocation}</Text></div>
                </section> : null}

                <section className="grid grid-cols-2 items-start gap-x-5 gap-y-6 border-y py-5 text-sm sm:grid-cols-4 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
                    <div className="grid min-w-0 gap-1.5"><Text type="supporting">{vi ? 'Ngày đăng' : 'Posted'}</Text><strong className="block leading-5">{dateLabel(attrs.created_at, activeLocale)}</strong></div>
                    <div className="grid min-w-0 gap-1.5"><Text type="supporting">{vi ? 'Loại tin' : 'Listing'}</Text><strong className="block leading-5">{attrs['listing-type'] === 'rent' ? messages.listingRent : messages.listingSale}</strong></div>
                    <div className="grid min-w-0 gap-1.5"><Text type="supporting">{vi ? 'Mã tin' : 'ID'}</Text><strong className="block leading-5">{property.id}</strong></div>
                    <div className="grid min-w-0 gap-1.5"><Text type="supporting">{vi ? 'Trạng thái' : 'Status'}</Text><strong className="block leading-5">{vi ? 'Đang hiển thị' : 'Published'}</strong></div>
                    <div className="col-span-2 flex items-center gap-3 sm:col-span-4 lg:col-span-1 lg:row-span-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={qrDataUrl} alt={vi ? `Mã QR tin ${property.id}` : `QR code for listing ${property.id}`} className="size-24 rounded-lg border bg-white p-1" />
                        <div className="lg:hidden"><strong className="block">{vi ? 'Quét mã để xem tin' : 'Scan to view'}</strong><span className="text-xs opacity-60">{vi ? 'Mở nhanh trên điện thoại' : 'Open on your phone'}</span></div>
                    </div>
                </section>

                <Card variant="default" padding={5}><Heading level={3}>{vi ? 'Bạn quan tâm bất động sản này?' : 'Interested in this property?'}</Heading><Text type="supporting">{vi ? 'Đặt lịch xem nhà hoặc gửi yêu cầu thuê trực tiếp cho chủ nhà.' : 'Schedule a viewing or send a rental request.'}</Text><div className="mt-4"><PropertyBookingActions locale={activeLocale} propertyId={property.id} canRent={attrs['listing-type'] === 'rent'} /></div></Card>
                {relatedProperties.length ? <section>
                    <Heading level={3}>{vi ? 'Bất động sản liên quan' : 'Related properties'}</Heading>
                    <Text type="supporting">{vi ? `Tin cùng ${attrs.city}, ưu tiên khu vực lân cận.` : `Listings in ${attrs.city}, with nearby areas first.`}</Text>
                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{relatedProperties.map((item) => <PropertyCard key={item.id} property={item} locale={activeLocale} />)}</div>
                </section> : null}
                <ReviewPanel locale={activeLocale} propertyId={property.id} listingType={attrs['listing-type']} />
            </div>

            <aside><PropertyContactCard owner={owner} locale={activeLocale} /></aside>
        </div>
    </main>;
}
