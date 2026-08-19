import { NextResponse } from 'next/server';
const API=process.env.BE_API_URL??process.env.NEXT_PUBLIC_BE_API_URL??'http://127.0.0.1:8000/api'; type C={params:Promise<{id:string}>};
export async function PATCH(request:Request,{params}:C){const {id}=await params;const r=await fetch(`${API}/v1/admin/owner-applications/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json',Accept:'application/json',Authorization:request.headers.get('authorization')??''},body:await request.text(),cache:'no-store'});return NextResponse.json(await r.json(),{status:r.status})}
