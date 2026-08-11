import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { getMessages } from '../../../../i18n/messages';
import { isLocale, type Locale } from '../../../../i18n/config';
import BookingPanel from './BookingPanel';
import ReviewPanel from './ReviewPanel';
import PropertyGallery from './PropertyGallery';
import {statusLabel} from '../../../../lib/displayLabels';
import PropertyViewCount from './PropertyViewCount';

type PropertyAttributes = {
    title: string;
    description: string | null;
    address: string | null;
    city: string | null;
    district: string | null;
    ward: string | null;
    price: string | null;
    area: string | null;
    status: string;
    'listing-type': string;
    'price-unit': string;
    'long-term-months'?: number | null;
    'long-term-price'?: string | null;
    'deposit-amount'?: string | null;
    'featured-image'?: string | null;
    'view-count'?: number;
};

type PropertyDetailResponse = {
    data?: {
        id: string;
        attributes: PropertyAttributes;
        relationships?: {
            amenities?: {
                data?: Array<{
                    id: string;
                    type: string;
                }>;
            };
            images?: {
                data?: Array<{
                    id: string;
                    type: string;
                }>;
            };
        };
    };
    included?: Array<{
        id: string;
        type: string;
        attributes?: {
            name?: string | null;
            icon?: string | null;
            description?: string | null;
            url?: string | null;
            'preview-url'?: string | null;
        };
    }>;
};

type Params = Promise<{
    locale: string;
    id: string;
}>;

type PageProps = {
    params: Params;
};

const API_BASE_URL =
    process.env.BE_API_URL ??
    process.env.NEXT_PUBLIC_BE_API_URL ??
    'http://127.0.0.1:8000/api';

export const dynamic = 'force-dynamic';

function getLocaleFormat(locale: Locale): string {
    return locale === 'en' ? 'en-US' : 'vi-VN';
}

function formatPrice(locale: Locale, price: string | null, unit: string): string {
    const messages = getMessages(locale);
    if (!price) {
        return messages.contact;
    }

    const parsed = Number(price);
    if (Number.isNaN(parsed)) {
        return `${price} ${messages.unitDisplay(unit)}`;
    }

    return `${parsed.toLocaleString(getLocaleFormat(locale))} ${messages.unitDisplay(unit)}`;
}

function formatArea(locale: Locale, area: string | null): string {
    const messages = getMessages(locale);
    if (!area) {
        return messages.updating;
    }

    const parsed = Number(area);
    if (Number.isNaN(parsed)) {
        return `${area} m2`;
    }

    return `${parsed.toLocaleString(getLocaleFormat(locale))} m2`;
}

async function getPropertyDetail(id: string): Promise<PropertyDetailResponse> {
    const response = await fetch(`${API_BASE_URL}/json-api/properties/${id}`, {
        cache: 'no-store',
    });

    if (response.status === 404) {
        return {};
    }

    if (!response.ok) {
        throw new Error('Failed to load property detail.');
    }

    return response.json();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale, id } = await params;
    const activeLocale: Locale = isLocale(locale) ? locale : 'vi';
    const messages = getMessages(activeLocale);

    try {
        const payload = await getPropertyDetail(id.replace(/[,.]+$/, ''));
        const title = payload.data?.attributes.title;

        return {
            title: title ? `${messages.propertyDetailTitle}: ${title}` : messages.propertyDetailTitle,
            description: messages.siteDescription,
        };
    } catch {
        return {
            title: messages.propertyDetailTitle,
            description: messages.siteDescription,
        };
    }
}

export default async function PropertyDetailPage({ params }: PageProps) {
    const { locale, id } = await params;
    const activeLocale: Locale = isLocale(locale) ? locale : 'vi';
    const messages = getMessages(activeLocale);

    const payload = await getPropertyDetail(id.replace(/[,.]+$/, ''));
    const property = payload.data;

    if (!property) {
        notFound();
    }

    const attrs = property.attributes;
    const location = [attrs.ward, attrs.district, attrs.city]
        .filter((value) => Boolean(value))
        .join(', ');
    const included = payload.included ?? [];

    const amenityMap = new Map(
        included
            .filter((entry) => entry.type === 'amenities')
            .map((entry) => [entry.id, entry.attributes]),
    );

    const amenities = (property.relationships?.amenities?.data ?? []).map((entry) => {
        const attrsFromIncluded = amenityMap.get(entry.id);
        return {
            id: entry.id,
            name: attrsFromIncluded?.name ?? null,
            icon: attrsFromIncluded?.icon ?? null,
        };
    });

    const imageMap = new Map(
        included
            .filter((entry) => entry.type === 'property-images')
            .map((entry) => [entry.id, entry.attributes]),
    );

    const relationshipImages = (property.relationships?.images?.data ?? [])
        .map((entry) => {
            const attrsFromIncluded = imageMap.get(entry.id);
            return {
                id: entry.id,
                url: attrsFromIncluded?.url ?? attrsFromIncluded?.['preview-url'] ?? null,
            };
        })
        .filter((image) => Boolean(image.url));

    const featuredImage = attrs['featured-image'];
    const imageUrls = [
        ...(featuredImage ? [{ id: 'featured', url: featuredImage }] : []),
        ...relationshipImages,
    ].filter((item, index, self) => self.findIndex((candidate) => candidate.url === item.url) === index);

    return (
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 md:px-8 md:py-12">
            <VStack gap={4}>
                <HStack justify="between" align="center" gap={3} wrap="wrap">
                    <Heading level={2}>{messages.propertyDetailTitle}</Heading>
                    <Button href={`/${activeLocale}`} label={messages.backToList} variant="secondary" />
                </HStack>

                <Card variant="default" padding={4} elevation="low">
                    <VStack gap={2}>
                        <Heading level={4}>{messages.photosTitle}</Heading>
                        {imageUrls.length > 0 ? (
                            <PropertyGallery images={imageUrls} title={attrs.title}/>
                        ) : (
                            <Text type="supporting">{messages.updating}</Text>
                        )}
                    </VStack>
                </Card>

                <Card variant="default" padding={4} elevation="low">
                    <VStack gap={3}>
                        <HStack justify="between" align="start" gap={2}>
                            <Heading level={3}>{attrs.title}</Heading>
                            <Link href={`/${activeLocale}?listing_type=${attrs['listing-type']}`}>
                                <Badge
                                    variant={attrs['listing-type'] === 'sale' ? 'success' : 'warning'}
                                    label={attrs['listing-type'] === 'sale' ? messages.listingSale : messages.listingRent}
                                />
                            </Link>
                        </HStack>

                        <PropertyViewCount propertyId={property.id} initialViews={attrs['view-count'] ?? 0}/>

                        {attrs.description ? <div className="property-description text-zinc-600 dark:text-zinc-300" dangerouslySetInnerHTML={{__html: attrs.description}}/> : <Text type="supporting">{messages.noDescription}</Text>}

                        <VStack gap={1}>
                            <Text>
                                <strong>{messages.priceLabel}:</strong> {formatPrice(activeLocale, attrs.price, attrs['price-unit'])}
                            </Text>
                            <Text>
                                <strong>{messages.areaLabel}:</strong> {formatArea(activeLocale, attrs.area)}
                            </Text>
                            <Text>
                                <strong>{messages.locationLabel}:</strong> {location || attrs.address || messages.updating}
                            </Text>
                            <Text>
                                <strong>{messages.statusLabel}:</strong> {statusLabel(attrs.status,activeLocale)}
                            </Text>
                        </VStack>
                    </VStack>
                </Card>

                <Card variant="default" padding={4} elevation="low">
                    <VStack gap={2}>
                        <Heading level={4}>{messages.amenitiesTitle}</Heading>
                        {amenities.length > 0 ? (
                            <HStack align="center" gap={2} wrap="wrap">
                                {amenities.map((amenity) => (
                                    <Badge
                                        key={amenity.id}
                                        variant="info"
                                        label={amenity.icon ? `${amenity.icon} ${amenity.name ?? amenity.id}` : amenity.name ?? amenity.id}
                                    />
                                ))}
                            </HStack>
                        ) : (
                            <Text type="supporting">{messages.noAmenities}</Text>
                        )}
                    </VStack>
                </Card>

                <BookingPanel
                    locale={activeLocale}
                    propertyId={property.id}
                    listingType={attrs['listing-type']}
                    unitPrice={attrs.price}
                    priceUnit={attrs['price-unit']}
                    longTermMonths={attrs['long-term-months']??null}
                    longTermPrice={attrs['long-term-price']??null}
                    depositAmount={attrs['deposit-amount']??null}
                />
                <ReviewPanel
                    locale={activeLocale}
                    propertyId={property.id}
                    listingType={attrs['listing-type']}
                />
            </VStack>
        </main>
    );
}
