'use client';

import {FormEvent,useState} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/VStack';
import {clearCustomerSession,getCustomerToken} from '../../../../lib/auth';

const inputClass='min-w-0 rounded-lg border border-zinc-300 bg-transparent px-3 py-2';

export default function PasswordForm({locale}:{locale:string}) {
    const router=useRouter();const[busy,setBusy]=useState(false);const[message,setMessage]=useState('');
    async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();const token=getCustomerToken();if(!token)return;setBusy(true);setMessage('');const body=Object.fromEntries(new FormData(event.currentTarget).entries());try{const response=await fetch('/api/auth/change-password',{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(body)});const result=await response.json();if(!response.ok){setMessage(result.error??result.message??'Không thể đổi mật khẩu.');return}clearCustomerSession();router.replace(`/${locale}/customer/login?reason=password-changed`);router.refresh()}catch{setMessage('Không thể đổi mật khẩu.')}finally{setBusy(false)}}
    return <Card variant="default" padding={5}><VStack gap={3}><Heading level={3}>Đổi mật khẩu</Heading><Text type="supporting">Sau khi đổi mật khẩu, tất cả thiết bị sẽ phải đăng nhập lại.</Text><form onSubmit={submit} className="grid min-w-0 max-w-xl gap-3"><label className="grid min-w-0 gap-1"><Text>Mật khẩu hiện tại</Text><input className={inputClass} name="current_password" type="password" autoComplete="current-password" required/></label><label className="grid min-w-0 gap-1"><Text>Mật khẩu mới</Text><input className={inputClass} name="password" type="password" autoComplete="new-password" minLength={8} required/></label><label className="grid min-w-0 gap-1"><Text>Xác nhận mật khẩu mới</Text><input className={inputClass} name="password_confirmation" type="password" autoComplete="new-password" minLength={8} required/></label><Button type="submit" label="Đổi mật khẩu" variant="secondary" isLoading={busy}/></form>{message?<Text>{message}</Text>:null}</VStack></Card>;
}
