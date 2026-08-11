import {NextResponse} from 'next/server';

const API_BASE_URL=process.env.BE_API_URL??process.env.NEXT_PUBLIC_BE_API_URL??'http://127.0.0.1:8000/api';

export async function POST(_request:Request,{params}:{params:Promise<{id:string}>}) {
    const {id}=await params;
    try {
        const response=await fetch(`${API_BASE_URL}/json-api/properties/${id}/view`,{
            method:'POST',
            headers:{Accept:'application/json'},
            cache:'no-store',
        });
        return NextResponse.json(await response.json(),{status:response.status});
    } catch {
        return NextResponse.json({error:'Không thể ghi nhận lượt xem.'},{status:500});
    }
}
