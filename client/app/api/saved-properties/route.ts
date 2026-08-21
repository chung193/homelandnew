import {NextResponse} from 'next/server';

const API=process.env.BE_API_URL??process.env.NEXT_PUBLIC_BE_API_URL??'http://127.0.0.1:8000/api';

export async function GET(request:Request){try{const response=await fetch(`${API}/v1/saved-properties`,{headers:{Accept:'application/json',Authorization:request.headers.get('authorization')??''},cache:'no-store'});return NextResponse.json(await response.json(),{status:response.status})}catch{return NextResponse.json({error:'Failed to load saved properties.'},{status:502})}}

export async function POST(request:Request){try{const response=await fetch(`${API}/v1/saved-properties`,{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json',Authorization:request.headers.get('authorization')??''},body:await request.text(),cache:'no-store'});return NextResponse.json(await response.json(),{status:response.status})}catch{return NextResponse.json({error:'Failed to save property.'},{status:502})}}
