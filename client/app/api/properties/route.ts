import { NextResponse } from 'next/server';

const API_BASE_URL =
    process.env.BE_API_URL ??
    process.env.NEXT_PUBLIC_BE_API_URL ??
    'http://127.0.0.1:8000/api';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams(searchParams.toString());
    const requestedPage = Number(params.get('page') ?? '1');
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    params.set('page', String(page));

    try {
        const response = await fetch(`${API_BASE_URL}/json-api/properties?${params.toString()}`, {
            cache: 'no-store',
        });

        if (!response.ok) {
            return NextResponse.json(
                { message: 'Unable to fetch properties from backend.' },
                { status: response.status },
            );
        }

        const payload = await response.json();
        return NextResponse.json(payload);
    } catch {
        return NextResponse.json({ message: 'Failed to connect to backend API.' }, { status: 500 });
    }
}
