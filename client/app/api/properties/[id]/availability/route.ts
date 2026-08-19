import { NextResponse } from 'next/server';

const API_BASE_URL =
    process.env.BE_API_URL ??
    process.env.NEXT_PUBLIC_BE_API_URL ??
    'http://127.0.0.1:8000/api';

type Params = Promise<{
    id: string;
}>;

type RouteContext = {
    params: Params;
};

export async function GET(request: Request, context: RouteContext) {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const qs = new URLSearchParams(searchParams.toString());

    try {
        const response = await fetch(`${API_BASE_URL}/v1/properties/${id}/availability?${qs.toString()}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
            cache: 'no-store',
        });

        const body = await response.json();
        return NextResponse.json(body, { status: response.status });
    } catch {
        return NextResponse.json({ error: 'Failed to load availability.' }, { status: 500 });
    }
}
