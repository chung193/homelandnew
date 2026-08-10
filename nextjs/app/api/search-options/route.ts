import { NextResponse } from 'next/server';

const API_BASE_URL =
    process.env.BE_API_URL ??
    process.env.NEXT_PUBLIC_BE_API_URL ??
    'http://127.0.0.1:8000/api';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let targetUrl = '';

    if (type === 'provinces') {
        targetUrl = `${API_BASE_URL}/locations/provinces`;
    }

    if (type === 'districts') {
        const provinceCode = searchParams.get('province_code');
        if (!provinceCode) {
            return NextResponse.json({ error: 'province_code is required' }, { status: 422 });
        }
        targetUrl = `${API_BASE_URL}/locations/districts?province_code=${encodeURIComponent(provinceCode)}`;
    }

    if (type === 'property-types') {
        targetUrl = `${API_BASE_URL}/v1/property-types/active`;
    }

    if (!targetUrl) {
        return NextResponse.json({ error: 'Unsupported option type' }, { status: 400 });
    }

    try {
        const response = await fetch(targetUrl, {
            cache: 'no-store',
            headers: {
                Accept: 'application/json',
            },
        });

        const payload = await response.json();
        return NextResponse.json(payload, { status: response.status });
    } catch {
        return NextResponse.json({ error: 'Failed to load search options' }, { status: 500 });
    }
}
