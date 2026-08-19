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

export async function PATCH(request: Request, context: RouteContext) {
    const authorization = request.headers.get('authorization');
    const { id } = await context.params;

    if (!authorization) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const response = await fetch(`${API_BASE_URL}/v1/bookings/${id}/reject`, {
            method: 'PATCH',
            headers: {
                Accept: 'application/json',
                Authorization: authorization,
            },
            cache: 'no-store',
        });

        const body = await response.json();
        return NextResponse.json(body, { status: response.status });
    } catch {
        return NextResponse.json({ error: 'Failed to reject booking.' }, { status: 500 });
    }
}
