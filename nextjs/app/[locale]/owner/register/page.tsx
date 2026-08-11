'use client';

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { getCustomerToken } from '../../../../lib/auth';

type Preview = { url: string; type: string; name: string };
type Application = { status?: 'pending'|'approved'|'rejected'; rejection_reason?: string|null };

function FilePreview({ preview }: { preview?: Preview }) {
    if (!preview) return null;
    if (preview.type === 'application/pdf') return <div className="mt-2 rounded-lg border p-3 text-sm">📄 {preview.name}</div>;
    return <Image src={preview.url} alt={preview.name} width={640} height={192} unoptimized className="mt-2 h-48 w-full rounded-xl border object-contain" />;
}

export default function OwnerRegisterPage() {
    const { locale='vi' }=useParams<{locale:string}>();
    const router=useRouter();
    const [busy,setBusy]=useState(false);
    const [message,setMessage]=useState('');
    const [application,setApplication]=useState<Application|null>(null);
    const [previews,setPreviews]=useState<Record<string,Preview>>({});
    const previewUrlsRef=useRef<string[]>([]);

    useEffect(()=>{const id=window.setTimeout(async()=>{const token=getCustomerToken();if(!token)return;try{const response=await fetch('/api/owner-application',{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});const result=await response.json();if(response.ok)setApplication(result.data??null)}catch{/* New applicants can still use the form. */}},0);return()=>clearTimeout(id)},[]);
    useEffect(()=>()=>{previewUrlsRef.current.forEach((url)=>URL.revokeObjectURL(url))},[]);

    function previewFile(field:string,event:ChangeEvent<HTMLInputElement>){const file=event.target.files?.[0];setPreviews((current)=>{if(current[field])URL.revokeObjectURL(current[field].url);const next={...current};if(file){const url=URL.createObjectURL(file);previewUrlsRef.current.push(url);next[field]={url,type:file.type,name:file.name}}else delete next[field];return next})}

    async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();const token=getCustomerToken();if(!token){router.push(`/${locale}/customer/login?redirect=/${locale}/owner/register`);return}setBusy(true);setMessage('');try{const response=await fetch('/api/owner-application',{method:'POST',headers:{Authorization:`Bearer ${token}`},body:new FormData(event.currentTarget)});const result=await response.json();if(response.ok){setApplication(result.data);setMessage('Đã gửi hồ sơ. Vui lòng chờ quản trị viên duyệt.')}else setMessage(result.error??result.message??'Không thể gửi hồ sơ.')}catch{setMessage('Không thể gửi hồ sơ.')}finally{setBusy(false)}}

    const approved=application?.status==='approved';
    return <main className="mx-auto w-full max-w-2xl px-4 py-10"><VStack gap={4}>
        {application?.status?<Card variant={approved?'green':application.status==='rejected'?'red':'muted'} padding={4}><VStack gap={1}><Heading level={4}>Trạng thái hồ sơ: {approved?'Đã duyệt':application.status==='rejected'?'Bị từ chối':'Đang chờ duyệt'}</Heading>{application.rejection_reason?<Text>Lý do: {application.rejection_reason}</Text>:null}</VStack></Card>:null}
        <Card variant="default" padding={5}><VStack gap={4}><Heading level={2}>Đăng ký tài khoản chủ bất động sản</Heading><Text type="supporting">Giấy tờ được lưu riêng tư và chỉ quản trị viên có quyền xem.</Text>
        {!approved?<form onSubmit={submit} className="flex flex-col gap-4">
            <label><Text>Mặt trước CCCD *</Text><input className="block w-full rounded-lg border p-2" name="identity_front" type="file" accept="image/jpeg,image/png,application/pdf" required onChange={(event)=>previewFile('front',event)}/><FilePreview preview={previews.front}/></label>
            <label><Text>Mặt sau CCCD</Text><input className="block w-full rounded-lg border p-2" name="identity_back" type="file" accept="image/jpeg,image/png,application/pdf" onChange={(event)=>previewFile('back',event)}/><FilePreview preview={previews.back}/></label>
            <label><Text>Giấy tờ chứng minh quyền sở hữu *</Text><input className="block w-full rounded-lg border p-2" name="ownership_document" type="file" accept="image/jpeg,image/png,application/pdf" required onChange={(event)=>previewFile('ownership',event)}/><FilePreview preview={previews.ownership}/></label>
            <label><Text>Ghi chú</Text><textarea className="block w-full rounded-lg border p-2" name="note" rows={3}/></label><Button type="submit" variant="primary" label={application?.status==='rejected'?'Gửi lại hồ sơ':'Gửi hồ sơ xét duyệt'} isLoading={busy}/>
        </form>:<Text>Hồ sơ của bạn đã được duyệt. Bạn có thể nạp tiền và đăng tin bất động sản.</Text>}{message?<Text>{message}</Text>:null}</VStack></Card>
    </VStack></main>;
}
