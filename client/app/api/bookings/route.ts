import { NextResponse } from 'next/server';

const API_BASE_URL =
    process.env.BE_API_URL ??
    process.env.NEXT_PUBLIC_BE_API_URL ??
    'http://127.0.0.1:8000/api';

export async function POST(request: Request) {
    const payload = await request.json();
    const authorization = request.headers.get('authorization');

    try {
        const response = await fetch(`${API_BASE_URL}/v1/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...(authorization ? { Authorization: authorization } : {}),
            },
            body: JSON.stringify(payload),
            cache: 'no-store',
        });

        const body = await response.json();
        return NextResponse.json(body, { status: response.status });
    } catch {
        return NextResponse.json({ error: 'Failed to connect to booking service.' }, { status: 500 });
    }
}
