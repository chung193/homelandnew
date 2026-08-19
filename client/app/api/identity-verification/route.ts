import { NextResponse } from 'next/server';
const API=process.env.BE_API_URL??process.env.NEXT_PUBLIC_BE_API_URL??'http://127.0.0.1:8000/api';
export async function GET(request:Request){const r=await fetch(`${API}/v1/identity-verification`,{headers:{Accept:'application/json',Authorization:request.headers.get('authorization')??''},cache:'no-store'});return NextResponse.json(await r.json(),{status:r.status})}
export async function POST(request:Request){const r=await fetch(`${API}/v1/identity-verification`,{method:'POST',headers:{Accept:'application/json',Authorization:request.headers.get('authorization')??''},body:await request.formData(),cache:'no-store'});return NextResponse.json(await r.json(),{status:r.status})}
