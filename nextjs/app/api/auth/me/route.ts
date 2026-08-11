import { NextResponse } from 'next/server';
const API = process.env.BE_API_URL ?? process.env.NEXT_PUBLIC_BE_API_URL ?? 'http://127.0.0.1:8000/api';
export async function GET(request: Request) {
    try {
        const response = await fetch(`${API}/v1/auth/me`, { headers: { Accept:'application/json', Authorization:request.headers.get('authorization') ?? '' }, cache:'no-store' });
        return NextResponse.json(await response.json(), { status:response.status });
    } catch { return NextResponse.json({error:'Failed to load account.'},{status:500}); }
}

export async function PUT(request: Request) {
    try {
        const response = await fetch(`${API}/v1/auth/me`, {
            method:'PUT',
            headers: { Accept:'application/json', Authorization:request.headers.get('authorization') ?? '' },
            body: await request.formData(),
            cache:'no-store',
        });
        return NextResponse.json(await response.json(), { status:response.status });
    } catch { return NextResponse.json({error:'Failed to update account.'},{status:500}); }
}
