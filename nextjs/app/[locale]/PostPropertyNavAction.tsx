'use client';
import { useRouter } from 'next/navigation';
import { getCustomerToken, getCustomerUser } from '../../lib/auth';
import type { Locale } from '../../i18n/config';
type WalletResponse = { data?: { balance?: number; posting_fee?: number; test_posting_credits?: number } };
export default function PostPropertyNavAction({ locale }: { locale: Locale }) {
 const router=useRouter();
 async function open(){const token=getCustomerToken();const user=getCustomerUser();if(!token||!user){router.push(`/${locale}/customer/login?redirect=${encodeURIComponent(`/${locale}/owner/properties/create`)}`);return}if(!user.is_verified){router.push(`/${locale}/customer/login`);return}if(user.account_type!=='property_owner'){router.push(`/${locale}/owner/register`);return}try{const response=await fetch('/api/wallet',{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});const result:WalletResponse=await response.json();const eligible=(result.data?.test_posting_credits??0)>0||(result.data?.balance??0)>=(result.data?.posting_fee??Number.MAX_SAFE_INTEGER);router.push(response.ok&&eligible?`/${locale}/owner/properties/create`:`/${locale}/wallet`)}catch{router.push(`/${locale}/wallet`)}}
 return <button type="button" className="topbar-link shrink-0 rounded-lg px-3 py-2 text-sm font-medium" onClick={()=>void open()}>{locale==='vi'?'Đăng tin':'Post property'}</button>;
}
