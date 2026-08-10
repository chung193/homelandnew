import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Carousel } from '@astryxdesign/core/Carousel';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import ThemeModeToggle from '../../ThemeModeToggle';
import { getMessages } from '../../../../i18n/messages';
import { isLocale, type Locale } from '../../../../i18n/config';

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
    'featured-image'?: string | null;
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
        const payload = await getPropertyDetail(id);
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

    const payload = await getPropertyDetail(id);
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
                    <VStack gap={2}>
                        <Heading level={2}>{messages.propertyDetailTitle}</Heading>
                        <ThemeModeToggle
                            labels={{
                                system: messages.themeSystem,
                                light: messages.themeLight,
                                dark: messages.themeDark,
                                night: messages.themeNight,
                            }}
                        />
                    </VStack>
                    <Button href={`/${activeLocale}`} label={messages.backToList} variant="secondary" />
                </HStack>

                <Card variant="default" padding={4} elevation="low">
                    <VStack gap={2}>
                        <Heading level={4}>{messages.photosTitle}</Heading>
                        {imageUrls.length > 0 ? (
                            <Carousel hasSnap hasButtons hasEdgeFade gap={2} aria-label={messages.photosTitle}>
                                {imageUrls.map((image) => (
                                    <img
                                        key={image.id}
                                        src={image.url ?? ''}
                                        alt={attrs.title}
                                        className="h-72 w-[min(100%,42rem)] shrink-0 rounded-xl object-cover"
                                        loading="lazy"
                                    />
                                ))}
                            </Carousel>
                        ) : (
                            <Text type="supporting">{messages.updating}</Text>
                        )}
                    </VStack>
                </Card>

                <Card variant="default" padding={4} elevation="low">
                    <VStack gap={3}>
                        <HStack justify="between" align="start" gap={2}>
                            <Heading level={3}>{attrs.title}</Heading>
                            <Badge
                                variant={attrs['listing-type'] === 'sale' ? 'success' : 'warning'}
                                label={attrs['listing-type'] === 'sale' ? messages.listingSale : messages.listingRent}
                            />
                        </HStack>

                        <Text type="supporting">{attrs.description || messages.noDescription}</Text>

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
                                <strong>{messages.statusLabel}:</strong> {attrs.status}
                            </Text>
                            <Text>
                                <strong>{messages.idLabel}:</strong> {property.id}
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
            </VStack>
        </main>
    );
}
