import { NextResponse } from 'next/server';
const API = process.env.BE_API_URL ?? process.env.NEXT_PUBLIC_BE_API_URL ?? 'http://127.0.0.1:8000/api';
const actions = new Set(['confirm', 'reject', 'cancel']);
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; action: string }> }) {
    const { id, action } = await params;
    if (!actions.has(action)) return NextResponse.json({ error: 'Unsupported action' }, { status: 404 });
    const response = await fetch(`${API}/v1/viewing-appointments/${id}/${action}`, { method: 'PATCH', headers: { Accept: 'application/json', Authorization: request.headers.get('authorization') ?? '' }, cache: 'no-store' });
    return NextResponse.json(await response.json(), { status: response.status });
}
