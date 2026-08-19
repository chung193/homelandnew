import { NextResponse } from 'next/server';
const API = process.env.BE_API_URL ?? process.env.NEXT_PUBLIC_BE_API_URL ?? 'http://127.0.0.1:8000/api';
export async function POST(request: Request) {
    try {
        const response = await fetch(`${API}/v1/auth/logout`, { headers: { Accept:'application/json', Authorization:request.headers.get('authorization') ?? '' }, cache:'no-store' });
        const body = await response.json();
        return NextResponse.json(body, { status:response.status });
    } catch { return NextResponse.json({error:'Failed to log out.'},{status:500}); }
}
