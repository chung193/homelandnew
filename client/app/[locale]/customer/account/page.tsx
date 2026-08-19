'use client';

import {useEffect,useState} from 'react';
import {useParams,useRouter} from 'next/navigation';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Heading} from '@astryxdesign/core/Heading';
import {HStack} from '@astryxdesign/core/HStack';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/VStack';
import {getCustomerToken,getCustomerUser,type CustomerUser} from '../../../../lib/auth';
import AccountTabs,{type AccountTab} from './AccountTabs';
import ProfileForm from './ProfileForm';
import PasswordForm from './PasswordForm';

export default function AccountPage() {
    const {locale='vi'}=useParams<{locale:string}>();
    const router=useRouter();
    const [user,setUser]=useState<CustomerUser|null>(null);
    const [activeTab,setActiveTab]=useState<AccountTab>('profile');

    useEffect(()=>{
        const token=getCustomerToken();
        if(!token){router.replace(`/${locale}/customer/login?redirect=/${locale}/customer/account`);return}
        void fetch('/api/auth/me',{headers:{Authorization:`Bearer ${token}`},cache:'no-store'})
            .then(async response=>({response,result:await response.json()}))
            .then(({response,result})=>{if(response.ok&&result.data)setUser(result.data)})
            .catch(()=>setUser(getCustomerUser()));
    },[locale,router]);

    if(!user)return <main className="mx-auto w-full max-w-4xl px-4 py-10"><Text>Đang tải thông tin...</Text></main>;

    return <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-10"><VStack gap={4}>
        <HStack align="center" gap={3} wrap="wrap"><Avatar src={user.avatar??undefined} name={user.name} size={64}/><VStack gap={1}><Heading level={2}>Thông tin tài khoản</Heading><Text type="supporting">{user.email}</Text></VStack></HStack>
        <AccountTabs activeTab={activeTab} onChange={setActiveTab}/>
        {activeTab==='profile'?<ProfileForm user={user} onUserChange={setUser}/>:<PasswordForm locale={locale}/>} 
    </VStack></main>;
}
