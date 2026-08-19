'use client';

import {useRouter,useSearchParams} from 'next/navigation';
import type {Locale} from '../../i18n/config';

export default function PropertyCategoryMenu({locale}:{locale:Locale}) {
    const router=useRouter();
    const searchParams=useSearchParams();
    const selected=searchParams.get('listing_type')??'';
    const vi=locale==='vi';

    return (
        <select
            aria-label={vi?'Danh mục bất động sản':'Property categories'}
            className="topbar-select mr-auto h-9 shrink-0 cursor-pointer rounded-lg border px-3 text-sm font-medium shadow-sm outline-none transition"
            value={selected}
            onChange={(event)=>{
                const listingType=event.target.value;
                router.push(listingType?`/${locale}?listing_type=${listingType}`:`/${locale}`);
            }}
        >
            <option value="">{vi?'Tất cả bất động sản':'All properties'}</option>
            <option value="sale">{vi?'Bất động sản bán':'Properties for sale'}</option>
            <option value="rent">{vi?'Bất động sản cho thuê':'Properties for rent'}</option>
        </select>
    );
}
