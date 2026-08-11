import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.BE_API_URL ?? process.env.NEXT_PUBLIC_BE_API_URL ?? 'http://127.0.0.1:8000/api';
type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
    const { id } = await params;
    try {
        const response = await fetch(`${API_BASE_URL}/v1/properties/${id}/reviews`, { cache: 'no-store' });
        return NextResponse.json(await response.json(), { status: response.status });
    } catch {
        return NextResponse.json({ error: 'Failed to load reviews.' }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: Context) {
    const { id } = await params;
    try {
        const response = await fetch(`${API_BASE_URL}/v1/properties/${id}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: request.headers.get('authorization') ?? '',
            },
            body: await request.text(),
            cache: 'no-store',
        });
        return NextResponse.json(await response.json(), { status: response.status });
    } catch {
        return NextResponse.json({ error: 'Failed to submit review.' }, { status: 500 });
    }
}
