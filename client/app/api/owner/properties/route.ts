import { NextResponse } from 'next/server';
const API = process.env.BE_API_URL ?? process.env.NEXT_PUBLIC_BE_API_URL ?? 'http://127.0.0.1:8000/api';
export async function POST(request: Request) {
    const response = await fetch(`${API}/v1/properties`, { method:'POST', headers:{ Accept:'application/json', Authorization:request.headers.get('authorization') ?? '' }, body:await request.formData(), cache:'no-store' });
    return NextResponse.json(await response.json(), { status:response.status });
}
