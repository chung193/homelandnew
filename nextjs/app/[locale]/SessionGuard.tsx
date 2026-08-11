'use client';

import {useCallback,useEffect} from 'react';
import {usePathname,useRouter} from 'next/navigation';
import {clearCustomerSession,getCustomerToken,setCustomerSession} from '../../lib/auth';

const CHECK_INTERVAL_MS=60_000;

export default function SessionGuard({locale}:{locale:string}) {
    const router=useRouter();
    const pathname=usePathname();

    const validateSession=useCallback(async()=>{
        const token=getCustomerToken();
        if(!token)return;

        try {
            const response=await fetch('/api/auth/me',{
                headers:{Authorization:`Bearer ${token}`},
                cache:'no-store',
            });
            if(response.status===401||response.status===403){
                clearCustomerSession();
                if(!pathname.includes('/customer/login')){
                    router.replace(`/${locale}/customer/login?reason=session-ended`);
                }
                return;
            }
            const result=await response.json();
            if(response.ok&&result.data)setCustomerSession({token,user:result.data});
        } catch {
            // Giữ phiên khi mất mạng; chỉ đăng xuất khi backend xác nhận token không hợp lệ.
        }
    },[locale,pathname,router]);

    useEffect(()=>{
        void validateSession();
        const interval=window.setInterval(()=>void validateSession(),CHECK_INTERVAL_MS);
        const onFocus=()=>void validateSession();
        window.addEventListener('focus',onFocus);
        return()=>{window.clearInterval(interval);window.removeEventListener('focus',onFocus)};
    },[validateSession]);

    return null;
}
