import type { Metadata } from 'next';
import { Badge } from '@astryxdesign/core/Badge';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import HeroSlider from './HeroSlider';
import PropertyInfiniteList from './PropertyInfiniteList';
import { getMessages } from '../../i18n/messages';
import { isLocale, locales, type Locale } from '../../i18n/config';

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
};

type PropertyItem = {
    id: string;
    attributes: PropertyAttributes;
};

type PropertyResponse = {
    data: PropertyItem[];
    meta?: {
        current_page?: number;
        per_page?: number;
        total?: number;
    };
};

type Params = Promise<{
    locale: string;
}>;

type PageProps = {
    params: Params;
    searchParams: Promise<{
        page?: string;
        q?: string;
        province_code?: string;
        city_code?: string;
        property_type_id?: string;
        listing_type?: string;
    }>;
};

const API_BASE_URL =
    process.env.BE_API_URL ??
    process.env.NEXT_PUBLIC_BE_API_URL ??
    'http://127.0.0.1:8000/api';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale } = await params;
    const activeLocale: Locale = isLocale(locale) ? locale : 'vi';
    const messages = getMessages(activeLocale);

    return {
        title: messages.siteTitle,
        description: messages.siteDescription,
    };
}

async function getPropertiesPage(
    page: number,
    filters: URLSearchParams,
    messages: ReturnType<typeof getMessages>,
): Promise<PropertyResponse> {
    const params = new URLSearchParams(filters.toString());
    params.set('page', String(page));

    const response = await fetch(`${API_BASE_URL}/json-api/properties?${params.toString()}`, {
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error(messages.loadErrorDetail);
    }

    return response.json();
}

export default async function LocaleHomePage({ params, searchParams }: PageProps) {
    const { locale } = await params;
    const { page, q, province_code, city_code, property_type_id, listing_type } = await searchParams;
    const activeLocale: Locale = isLocale(locale) ? locale : 'vi';
    const messages = getMessages(activeLocale);
    const requestedPage = Number(page ?? '1');
    const targetPage = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const filterParams = new URLSearchParams();

    if (q) {
        filterParams.set('q', q);
    }
    if (province_code) {
        filterParams.set('province_code', province_code);
    }
    if (city_code) {
        filterParams.set('city_code', city_code);
    }
    if (property_type_id) {
        filterParams.set('property_type_id', property_type_id);
    }
    if (listing_type === 'sale' || listing_type === 'rent') {
        filterParams.set('listing_type', listing_type);
    }

    let properties: PropertyItem[] = [];
    let currentPage = 1;
    let total = 0;
    let errorMessage = '';

    try {
        const firstPayload = await getPropertiesPage(1, filterParams, messages);
        properties = firstPayload.data ?? [];
        currentPage = firstPayload.meta?.current_page ?? 1;
        total = firstPayload.meta?.total ?? properties.length;

        if (targetPage > 1) {
            for (let pageToLoad = 2; pageToLoad <= targetPage; pageToLoad += 1) {
                const nextPayload = await getPropertiesPage(pageToLoad, filterParams, messages);
                const incoming = nextPayload.data ?? [];
                if (incoming.length === 0) {
                    break;
                }

                const knownIds = new Set(properties.map((item) => item.id));
                const uniqueIncoming = incoming.filter((item) => !knownIds.has(item.id));
                properties = [...properties, ...uniqueIncoming];
                currentPage = nextPayload.meta?.current_page ?? pageToLoad;
                total = nextPayload.meta?.total ?? total;

                if (properties.length >= total) {
                    break;
                }
            }
        }
    } catch (error) {
        errorMessage = error instanceof Error ? error.message : messages.loadErrorDetail;
    }

    return (
        <>
            <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 md:px-8 md:py-12">
                <VStack gap={4}>
                    <HeroSlider locale={activeLocale} />

                    <HStack justify="between" align="center" gap={3} wrap="wrap">
                        <VStack gap={1}>
                            <Heading level={1}>{messages.heroTitle}</Heading>
                            {messages.heroSubtitle ? <Text type="supporting">{messages.heroSubtitle}</Text> : null}
                        </VStack>

                        <Badge variant="info" label={`${messages.totalLabel}: ${total}`} />
                    </HStack>

                    {errorMessage ? (
                        <Card variant="red" padding={4}>
                            <VStack gap={2}>
                                <Heading level={3}>{messages.loadErrorTitle}</Heading>
                                <Text>{errorMessage}</Text>
                                <Text type="supporting">{messages.loadErrorHint}</Text>
                            </VStack>
                        </Card>
                    ) : null}

                    {!errorMessage ? (
                        <PropertyInfiniteList
                            locale={activeLocale}
                            initialProperties={properties}
                            initialCurrentPage={currentPage}
                            initialTotal={total}
                        />
                    ) : null}
                </VStack>
            </main>
        </>
    );
}
