import { NextResponse } from 'next/server';

const API_BASE_URL =
    process.env.BE_API_URL ??
    process.env.NEXT_PUBLIC_BE_API_URL ??
    'http://127.0.0.1:8000/api';

export async function POST(request: Request) {
    const payload = await request.json();

    try {
        const response = await fetch(`${API_BASE_URL}/v1/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(payload),
            cache: 'no-store',
        });

        const body = await response.json();
        return NextResponse.json(body, { status: response.status });
    } catch {
        return NextResponse.json({ error: 'Failed to connect to auth service.' }, { status: 500 });
    }
}
