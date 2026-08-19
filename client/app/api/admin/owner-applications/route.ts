import { NextResponse } from 'next/server';
const API=process.env.BE_API_URL??process.env.NEXT_PUBLIC_BE_API_URL??'http://127.0.0.1:8000/api';
export async function GET(request:Request){const r=await fetch(`${API}/v1/admin/owner-applications`,{headers:{Accept:'application/json',Authorization:request.headers.get('authorization')??''},cache:'no-store'});return NextResponse.json(await r.json(),{status:r.status})}
