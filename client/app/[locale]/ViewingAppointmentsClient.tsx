'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { getCustomerToken } from '../../lib/auth';

type Item = { id:number; appointment_date:string; start_time:string; end_time:string; note?:string|null; status:'pending'|'confirmed'|'rejected'|'cancelled'; property?:{title?:string;address?:string}; viewer?:{name?:string;email?:string;phone?:string}; owner?:{name?:string;email?:string;phone?:string} };
const labels:Record<Item['status'],string>={pending:'Đang chờ',confirmed:'Đã đồng ý',rejected:'Đã từ chối',cancelled:'Đã hủy'};

export default function ViewingAppointmentsClient({ owner }: { owner: boolean }) {
    const { locale='vi' }=useParams<{locale:string}>(); const vi=locale==='vi'; const router=useRouter();
    const [items,setItems]=useState<Item[]>([]); const [loading,setLoading]=useState(true); const [feedback,setFeedback]=useState(''); const [busy,setBusy]=useState<number|null>(null);
    const load=useCallback(async()=>{const token=getCustomerToken();if(!token){router.replace(`/${locale}/customer/login?redirect=/${locale}/${owner?'owner':'customer'}/viewing-appointments`);return}try{const response=await fetch(owner?'/api/owner/viewing-appointments':'/api/viewing-appointments/mine',{headers:{Accept:'application/json',Authorization:`Bearer ${token}`},cache:'no-store'});const result=await response.json();if(!response.ok)throw new Error(result.error);setItems(Array.isArray(result.data)?result.data:[])}catch{setFeedback(vi?'Không thể tải lịch xem nhà.':'Could not load viewing appointments.')}finally{setLoading(false)}},[locale,owner,router,vi]);
    useEffect(()=>{const timer=window.setTimeout(()=>void load(),0);return()=>window.clearTimeout(timer)},[load]);
    async function action(id:number,name:'confirm'|'reject'|'cancel'){const token=getCustomerToken();if(!token)return;setBusy(id);setFeedback('');try{const response=await fetch(`/api/viewing-appointments/${id}/${name}`,{method:'PATCH',headers:{Accept:'application/json',Authorization:`Bearer ${token}`}});const result=await response.json();setFeedback(response.ok?(vi?'Đã cập nhật lịch hẹn.':'Appointment updated.'):(result.error??'Update failed'));if(response.ok)await load()}catch{setFeedback(vi?'Không thể cập nhật lịch hẹn.':'Could not update appointment.')}finally{setBusy(null)}}
    return <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 md:px-8 md:py-12"><VStack gap={4}>
        <VStack gap={1}><Heading level={2}>{owner?(vi?'Yêu cầu xem nhà':'Viewing requests'):(vi?'Lịch xem nhà của tôi':'My property viewings')}</Heading><Text type="supporting">{owner?(vi?'Xác nhận khung giờ phù hợp hoặc từ chối để khách chọn lịch khác.':'Confirm a suitable time or decline so the viewer can choose another.'):(vi?'Theo dõi phản hồi của chủ nhà cho các lịch bạn đã đặt.':'Track owner responses to your requests.')}</Text></VStack>
        {feedback?<Card variant="default" padding={3}><Text>{feedback}</Text></Card>:null}
        {loading?<Text>{vi?'Đang tải...':'Loading...'}</Text>:null}
        {!loading&&items.length===0?<Card variant="muted" padding={4}><Text>{vi?'Chưa có lịch xem nhà nào.':'No viewing appointments yet.'}</Text></Card>:null}
        {items.map(item=><Card key={item.id} variant="default" padding={4} elevation="low"><VStack gap={2}>
            <HStack justify="between" align="center" wrap="wrap" gap={2}><Heading level={4}>{item.property?.title??(vi?'Bất động sản':'Property')}</Heading><Badge label={vi?labels[item.status]:item.status} variant={item.status==='confirmed'?'success':item.status==='pending'?'warning':'error'} /></HStack>
            <Text><strong>{vi?'Thời gian:':'Time:'}</strong> {item.appointment_date}, {item.start_time}–{item.end_time}</Text>
            {item.property?.address?<Text><strong>{vi?'Địa chỉ:':'Address:'}</strong> {item.property.address}</Text>:null}
            {owner&&item.viewer?<Text><strong>{vi?'Khách xem:':'Viewer:'}</strong> {item.viewer.name} · {item.viewer.phone||item.viewer.email}</Text>:null}
            {!owner&&item.status==='confirmed'&&item.owner?<Text><strong>{vi?'Liên hệ chủ nhà:':'Owner contact:'}</strong> {item.owner.name} · {item.owner.phone||item.owner.email}</Text>:null}
            {item.note?<Text><strong>{vi?'Ghi chú:':'Note:'}</strong> {item.note}</Text>:null}
            {owner&&item.status==='pending'?<HStack gap={2} wrap="wrap"><Button label={vi?'Đồng ý khung giờ':'Confirm'} variant="primary" isLoading={busy===item.id} onClick={()=>void action(item.id,'confirm')} /><Button label={vi?'Từ chối':'Decline'} variant="secondary" isLoading={busy===item.id} onClick={()=>void action(item.id,'reject')} /></HStack>:null}
            {!owner&&['pending','confirmed'].includes(item.status)?<Button label={vi?'Hủy lịch':'Cancel'} variant="secondary" isLoading={busy===item.id} onClick={()=>void action(item.id,'cancel')} />:null}
        </VStack></Card>)}
    </VStack></main>;
}
