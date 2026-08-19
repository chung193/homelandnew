import { NextResponse } from 'next/server';

const API_BASE_URL =
    process.env.BE_API_URL ??
    process.env.NEXT_PUBLIC_BE_API_URL ??
    'http://127.0.0.1:8000/api';

export async function GET(request: Request) {
    const authorization = request.headers.get('authorization');

    if (!authorization) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const response = await fetch(`${API_BASE_URL}/v1/owner/bookings`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: authorization,
            },
            cache: 'no-store',
        });

        const body = await response.json();
        return NextResponse.json(body, { status: response.status });
    } catch {
        return NextResponse.json({ error: 'Failed to load owner bookings.' }, { status: 500 });
    }
}
