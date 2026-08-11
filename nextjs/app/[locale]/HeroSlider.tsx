'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Locale } from '../../i18n/config';
import { getMessages } from '../../i18n/messages';

const HERO_IMAGES = [
    {
        src: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1800&q=80',
        title: 'Biệt thự ven hồ',
        subtitle: 'Không gian nghỉ dưỡng đẳng cấp với thiết kế mở.',
    },
    {
        src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=80',
        title: 'Căn hộ hiện đại',
        subtitle: 'Phong cách tối giản, ánh sáng tự nhiên tràn ngập.',
    },
    {
        src: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1800&q=80',
        title: 'Nhà phố cao cấp',
        subtitle: 'Vị trí trung tâm, kết nối tiện ích hoàn hảo.',
    },
    {
        src: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1800&q=80',
        title: 'Penthouse skyline',
        subtitle: 'Tầm nhìn thành phố tuyệt đẹp cả ngày lẫn đêm.',
    },
];

const AUTO_CHANGE_MS = 4500;

type OptionItem = {
    id: number;
    code?: number;
    name: string;
};

type HeroSliderProps = {
    locale: Locale;
};

export default function HeroSlider({ locale }: HeroSliderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const messages = getMessages(locale);

    const [index, setIndex] = useState(0);
    const [keyword, setKeyword] = useState(searchParams.get('q') ?? '');
    const [provinceCode, setProvinceCode] = useState(searchParams.get('province_code') ?? '');
    const [cityCode, setCityCode] = useState(searchParams.get('city_code') ?? '');
    const [propertyTypeId, setPropertyTypeId] = useState(searchParams.get('property_type_id') ?? '');
    const [provinces, setProvinces] = useState<OptionItem[]>([]);
    const [cities, setCities] = useState<OptionItem[]>([]);
    const [propertyTypes, setPropertyTypes] = useState<OptionItem[]>([]);

    const slides = useMemo(() => HERO_IMAGES, []);
    const searchParamString = searchParams.toString();

    useEffect(() => {
        const timer=window.setTimeout(()=>{
            const currentParams=new URLSearchParams(searchParamString);
            setKeyword(currentParams.get('q') ?? '');
            setProvinceCode(currentParams.get('province_code') ?? '');
            setCityCode(currentParams.get('city_code') ?? '');
            setPropertyTypeId(currentParams.get('property_type_id') ?? '');
        },0);
        return()=>window.clearTimeout(timer);
    }, [searchParamString]);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setIndex((current) => (current + 1) % slides.length);
        }, AUTO_CHANGE_MS);

        return () => {
            window.clearInterval(timer);
        };
    }, [slides.length]);

    const activeSlide = slides[index];

    useEffect(() => {
        async function loadStaticOptions() {
            const [provinceResponse, propertyTypeResponse] = await Promise.all([
                fetch('/api/search-options?type=provinces', { cache: 'no-store' }),
                fetch('/api/search-options?type=property-types', { cache: 'no-store' }),
            ]);

            if (provinceResponse.ok) {
                const provincePayload = await provinceResponse.json();
                setProvinces(provincePayload?.data?.data ?? provincePayload?.data ?? []);
            }

            if (propertyTypeResponse.ok) {
                const propertyTypePayload = await propertyTypeResponse.json();
                setPropertyTypes(propertyTypePayload?.data?.data ?? propertyTypePayload?.data ?? []);
            }
        }

        void loadStaticOptions();
    }, []);

    useEffect(() => {
        if (!provinceCode) {
            const timer=window.setTimeout(()=>{setCities([]);setCityCode('')},0);
            return()=>window.clearTimeout(timer);
        }

        async function loadCities() {
            const response = await fetch(
                `/api/search-options?type=districts&province_code=${encodeURIComponent(provinceCode)}`,
                { cache: 'no-store' },
            );

            if (!response.ok) {
                setCities([]);
                return;
            }

            const payload = await response.json();
            setCities(payload?.data ?? []);
        }

        void loadCities();
    }, [provinceCode]);

    function handleSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const params = new URLSearchParams();
        if (keyword.trim()) {
            params.set('q', keyword.trim());
        }
        if (provinceCode) {
            params.set('province_code', provinceCode);
        }
        if (cityCode) {
            params.set('city_code', cityCode);
        }
        if (propertyTypeId) {
            params.set('property_type_id', propertyTypeId);
        }

        params.set('page', '1');
        router.push(`${pathname}?${params.toString()}`);
    }

    function handleResetFilters() {
        setKeyword('');
        setProvinceCode('');
        setCityCode('');
        setPropertyTypeId('');
        router.push(`${pathname}?page=1`);
    }

    const selectedProvince = provinces.find(
        (province) => String(province.code ?? province.id) === provinceCode,
    );
    const selectedCity = cities.find((city) => String(city.code ?? city.id) === cityCode);
    const selectedPropertyType = propertyTypes.find((type) => String(type.id) === propertyTypeId);

    const activeFilters = [
        keyword.trim() ? keyword.trim() : null,
        selectedProvince?.name ?? null,
        selectedCity?.name ?? null,
        selectedPropertyType?.name ?? null,
    ].filter((item): item is string => Boolean(item));

    return (
        <VStack gap={3}>
            <section className="hero-slider-shell relative min-h-[620px] overflow-hidden rounded-2xl border md:min-h-[420px]">
                <img
                    src={activeSlide.src}
                    alt={activeSlide.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="eager"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

                <div className="absolute inset-x-0 top-0 p-4 md:p-6">
                    <form
                        onSubmit={handleSearch}
                        className="hero-search-panel mx-auto flex w-full max-w-5xl flex-col gap-3 rounded-2xl border p-4 text-white backdrop-blur md:flex-row md:items-end"
                    >
                        <label className="flex flex-1 flex-col gap-1">
                            <Text color="inherit">{messages.searchPlaceholder}</Text>
                            <input
                                value={keyword}
                                onChange={(event) => setKeyword(event.target.value)}
                                placeholder={messages.searchPlaceholder}
                                className="hero-search-input h-10 rounded-lg border px-3 text-sm outline-none"
                            />
                        </label>

                        <label className="flex min-w-[170px] flex-col gap-1">
                            <Text color="inherit">{messages.searchProvinceLabel}</Text>
                            <select
                                value={provinceCode}
                                onChange={(event) => setProvinceCode(event.target.value)}
                                className="hero-search-input select-soft h-10 border px-2 text-sm outline-none"
                            >
                                <option value="">{messages.searchAllOption}</option>
                                {provinces.map((province) => (
                                    <option key={`province-${province.id}`} value={String(province.code ?? province.id)}>
                                        {province.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="flex min-w-[170px] flex-col gap-1">
                            <Text color="inherit">{messages.searchCityLabel}</Text>
                            <select
                                value={cityCode}
                                onChange={(event) => setCityCode(event.target.value)}
                                disabled={!provinceCode}
                                className="hero-search-input select-soft h-10 border px-2 text-sm outline-none disabled:opacity-60"
                            >
                                <option value="">
                                    {provinceCode ? messages.searchAllOption : messages.searchSelectProvinceFirst}
                                </option>
                                {cities.map((city) => (
                                    <option key={`city-${city.id}`} value={String(city.code ?? city.id)}>
                                        {city.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="flex min-w-[170px] flex-col gap-1">
                            <Text color="inherit">{messages.searchPropertyTypeLabel}</Text>
                            <select
                                value={propertyTypeId}
                                onChange={(event) => setPropertyTypeId(event.target.value)}
                                className="hero-search-input select-soft h-10 border px-2 text-sm outline-none"
                            >
                                <option value="">{messages.searchAllOption}</option>
                                {propertyTypes.map((type) => (
                                    <option key={`ptype-${type.id}`} value={String(type.id)}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <div className="grid grid-cols-2 gap-2 md:flex md:shrink-0">
                            <Button className="h-10 min-w-24 whitespace-nowrap" label={messages.searchButton} variant="primary" type="submit" />
                            <Button
                                className="h-10 min-w-24 whitespace-nowrap !border-white !bg-white !text-zinc-900 hover:!bg-zinc-100"
                                label={messages.searchResetButton}
                                variant="secondary"
                                type="button"
                                onClick={handleResetFilters}
                            />
                        </div>
                    </form>
                </div>

                <div className="hero-caption absolute inset-x-0 bottom-0 p-4 md:p-6">
                    <VStack gap={2}>
                        <Heading level={2} color="inherit">
                            {activeSlide.title}
                        </Heading>
                        <Text color="inherit">{activeSlide.subtitle}</Text>

                        <HStack gap={1} align="center" wrap="wrap">
                            <Button
                                label="Trước"
                                variant="secondary"
                                icon={<span aria-hidden="true">◀</span>}
                                isIconOnly
                                onClick={() => {
                                    setIndex((current) => (current - 1 + slides.length) % slides.length);
                                }}
                            />
                            <Button
                                label="Tiếp"
                                variant="secondary"
                                icon={<span aria-hidden="true">▶</span>}
                                isIconOnly
                                onClick={() => {
                                    setIndex((current) => (current + 1) % slides.length);
                                }}
                            />
                            <HStack gap={1} align="center">
                                {slides.map((_, dotIndex) => (
                                    <button
                                        key={`slide-dot-${dotIndex}`}
                                        type="button"
                                        onClick={() => setIndex(dotIndex)}
                                        aria-label={`Go to slide ${dotIndex + 1}`}
                                        className={`h-2.5 w-2.5 rounded-full transition ${dotIndex === index ? 'bg-white' : 'bg-white/45'
                                            }`}
                                    />
                                ))}
                            </HStack>
                        </HStack>
                    </VStack>
                </div>
            </section>

            {activeFilters.length > 0 ? (
                <HStack align="center" gap={2} wrap="wrap">
                    <Text type="supporting">{messages.activeFiltersLabel}:</Text>
                    {activeFilters.map((filterValue) => (
                        <Badge key={`active-filter-${filterValue}`} variant="info" label={filterValue} />
                    ))}
                </HStack>
            ) : null}
        </VStack>
    );
}
