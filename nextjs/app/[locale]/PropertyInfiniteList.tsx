'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getMessages } from '../../i18n/messages';
import type { Locale } from '../../i18n/config';
import { getCustomerToken } from '../../lib/auth';

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

type PropertyInfiniteListProps = {
    locale: Locale;
    initialProperties: PropertyItem[];
    initialCurrentPage: number;
    initialTotal: number;
};

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

export default function PropertyInfiniteList({
    locale,
    initialProperties,
    initialCurrentPage,
    initialTotal,
}: PropertyInfiniteListProps) {
    const messages = getMessages(locale);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [properties, setProperties] = useState<PropertyItem[]>(initialProperties);
    const [currentPage, setCurrentPage] = useState<number>(initialCurrentPage);
    const [total, setTotal] = useState<number>(initialTotal);
    const [isExhausted, setIsExhausted] = useState<boolean>(initialProperties.length >= initialTotal);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadError, setLoadError] = useState<string>('');
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    const hasMore = !isExhausted && properties.length < total;

    useEffect(() => {
        const savedScroll = sessionStorage.getItem('homelend:scrollY');
        if (!savedScroll) {
            return;
        }

        const position = Number(savedScroll);
        if (!Number.isNaN(position)) {
            window.scrollTo({ top: position, behavior: 'auto' });
        }

        sessionStorage.removeItem('homelend:scrollY');
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (params.get('page') === String(currentPage)) {
            return;
        }

        params.set('page', String(currentPage));
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [currentPage, pathname, router, searchParams]);

    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore) {
            return;
        }

        setIsLoading(true);
        setLoadError('');

        const nextPage = currentPage + 1;
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(nextPage));

        try {
            const response = await fetch(`/api/properties?${params.toString()}`, {
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error(messages.loadErrorDetail);
            }

            const payload: PropertyResponse = await response.json();
            const incoming = payload.data ?? [];
            const responseTotal = payload.meta?.total;

            if (incoming.length === 0) {
                setIsExhausted(true);
            }

            setProperties((previous) => {
                const existingIds = new Set(previous.map((item) => item.id));
                const uniqueIncoming = incoming.filter((item) => !existingIds.has(item.id));
                const combined = [...previous, ...uniqueIncoming];

                if (typeof responseTotal === 'number' && combined.length >= responseTotal) {
                    setIsExhausted(true);
                }

                return combined;
            });

            setCurrentPage(payload.meta?.current_page ?? nextPage);

            if (typeof responseTotal === 'number') {
                setTotal(responseTotal);
            }
        } catch (error) {
            setLoadError(error instanceof Error ? error.message : messages.loadErrorDetail);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, hasMore, isLoading, messages.loadErrorDetail, searchParams]);

    useEffect(() => {
        if (!hasMore || !sentinelRef.current) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry?.isIntersecting) {
                    void loadMore();
                }
            },
            {
                rootMargin: '300px 0px',
            },
        );

        observer.observe(sentinelRef.current);

        return () => {
            observer.disconnect();
        };
    }, [hasMore, loadMore]);

    const cards = useMemo(
        () =>
            properties.map((property) => {
                const attrs = property.attributes;
                const location = [attrs.ward, attrs.district, attrs.city]
                    .filter((value) => Boolean(value))
                    .join(', ');

                return (
                    <Card key={property.id} variant="default" padding={4} elevation="low">
                        <VStack gap={3}>
                            {attrs['featured-image'] ? (
                                <img
                                    src={attrs['featured-image']}
                                    alt={attrs.title}
                                    className="h-48 w-full rounded-xl object-cover"
                                    loading="lazy"
                                />
                            ) : null}

                            <HStack justify="between" align="start" gap={2}>
                                <Heading level={4}>{attrs.title}</Heading>
                                <Badge
                                    variant={attrs['listing-type'] === 'sale' ? 'success' : 'warning'}
                                    label={attrs['listing-type'] === 'sale' ? messages.listingSale : messages.listingRent}
                                />
                            </HStack>

                            <Text type="supporting">{attrs.description || messages.noDescription}</Text>

                            <VStack gap={1}>
                                <Text>
                                    <strong>{messages.priceLabel}:</strong>{' '}
                                    {formatPrice(locale, attrs.price, attrs['price-unit'])}
                                </Text>
                                <Text>
                                    <strong>{messages.areaLabel}:</strong> {formatArea(locale, attrs.area)}
                                </Text>
                                <Text>
                                    <strong>{messages.locationLabel}:</strong>{' '}
                                    {location || attrs.address || messages.updating}
                                </Text>
                                <Text>
                                    <strong>{messages.statusLabel}:</strong> {attrs.status}
                                </Text>
                            </VStack>

                            <HStack justify="between" align="center" gap={2} wrap="wrap">
                                <Button
                                    label={messages.viewDetail}
                                    variant="secondary"
                                    onClick={() => {
                                        router.push(`/${locale}/property/${property.id}`);
                                    }}
                                />
                                <Button
                                    label={messages.bookNow}
                                    variant="primary"
                                    onClick={() => {
                                        const bookingTarget = `/${locale}/property/${property.id}?intent=book`;
                                        const token = getCustomerToken();

                                        if (token) {
                                            router.push(bookingTarget);
                                            return;
                                        }

                                        router.push(
                                            `/${locale}/customer/login?redirect=${encodeURIComponent(bookingTarget)}`,
                                        );
                                    }}
                                />
                                <Text type="supporting">
                                    {messages.idLabel}: {property.id}
                                </Text>
                            </HStack>
                        </VStack>
                    </Card>
                );
            }),
        [locale, messages, properties],
    );

    return (
        <>
            <section
                aria-label={messages.listAriaLabel}
                className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
                {cards}
            </section>

            {properties.length === 0 ? (
                <Card variant="muted" padding={4}>
                    <Text>{messages.emptyState}</Text>
                </Card>
            ) : null}

            {loadError ? (
                <Card variant="orange" padding={3}>
                    <VStack gap={2}>
                        <Text>{loadError}</Text>
                        <Button label={messages.retryLoadMore} variant="secondary" onClick={() => void loadMore()} />
                    </VStack>
                </Card>
            ) : null}

            {!hasMore && properties.length > 0 ? (
                <Card variant="muted" padding={3}>
                    <Text>{messages.allLoaded}</Text>
                </Card>
            ) : null}

            {isLoading ? (
                <section
                    aria-hidden="true"
                    className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
                >
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Card key={`skeleton-${index}`} variant="default" padding={4} elevation="low">
                            <VStack gap={3}>
                                <Skeleton width="70%" height={20} radius={2} index={index * 5} />
                                <Skeleton width="100%" height={16} radius={2} index={index * 5 + 1} />
                                <Skeleton width="84%" height={16} radius={2} index={index * 5 + 2} />
                                <Skeleton width="65%" height={16} radius={2} index={index * 5 + 3} />
                                <Skeleton width="50%" height={40} radius={3} index={index * 5 + 4} />
                            </VStack>
                        </Card>
                    ))}
                </section>
            ) : null}

            <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />
        </>
    );
}
