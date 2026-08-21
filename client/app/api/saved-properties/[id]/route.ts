import {NextResponse} from 'next/server';

const API=process.env.BE_API_URL??process.env.NEXT_PUBLIC_BE_API_URL??'http://127.0.0.1:8000/api';

export async function DELETE(request:Request,{params}:{params:Promise<{id:string}>}){try{const{id}=await params;const response=await fetch(`${API}/v1/saved-properties/${encodeURIComponent(id)}`,{method:'DELETE',headers:{Accept:'application/json',Authorization:request.headers.get('authorization')??''},cache:'no-store'});return NextResponse.json(await response.json(),{status:response.status})}catch{return NextResponse.json({error:'Failed to remove saved property.'},{status:502})}}
