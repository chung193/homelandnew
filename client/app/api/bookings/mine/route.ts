import { NextResponse } from 'next/server';
const API=process.env.BE_API_URL??process.env.NEXT_PUBLIC_BE_API_URL??'http://127.0.0.1:8000/api';
export async function GET(request:Request){const authorization=request.headers.get('authorization')??'';const response=await fetch(`${API}/v1/my-bookings`,{headers:{Accept:'application/json',Authorization:authorization},cache:'no-store'});return NextResponse.json(await response.json(),{status:response.status})}
