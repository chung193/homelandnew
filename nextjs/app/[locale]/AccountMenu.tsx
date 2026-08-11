'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Button } from '@astryxdesign/core/Button';
import { Text } from '@astryxdesign/core/Text';
import { clearCustomerSession, getCustomerToken, getCustomerUser, setCustomerSession, type CustomerUser } from '../../lib/auth';
import type { Locale } from '../../i18n/config';

type MeResponse = { data?: CustomerUser };

export default function AccountMenu({ locale }: { locale: Locale }) {
    const router = useRouter();
    const detailsRef = useRef<HTMLDetailsElement>(null);
    const [user, setUser] = useState<CustomerUser | null>(null);
    const vi = locale === 'vi';

    const loadSession = useCallback(async () => {
        const token = getCustomerToken();
        const cachedUser = getCustomerUser();
        setUser(cachedUser);
        if (!token) return;
        try {
            const response = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` }, cache:'no-store' });
            if (response.status === 401) { clearCustomerSession(); setUser(null); return; }
            const result: MeResponse = await response.json();
            if (response.ok && result.data) { setCustomerSession({token,user:result.data}); setUser(result.data); }
        } catch { /* Keep the cached profile while offline. */ }
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => void loadSession(), 0);
        const listener = () => setUser(getCustomerUser());
        window.addEventListener('homelend:session-changed', listener);
        return () => { window.clearTimeout(timer); window.removeEventListener('homelend:session-changed', listener); };
    }, [loadSession]);

    function go(path: string) { detailsRef.current?.removeAttribute('open'); router.push(path); }

    async function logout() {
        const token = getCustomerToken();
        if (token) {
            try { await fetch('/api/auth/logout', { method:'POST', headers:{Authorization:`Bearer ${token}`} }); } catch { /* Local logout still succeeds. */ }
        }
        clearCustomerSession(); setUser(null); detailsRef.current?.removeAttribute('open'); router.push(`/${locale}`); router.refresh();
    }

    if (!user) return <Button label={vi ? 'Đăng nhập' : 'Log in'} variant="secondary" onClick={() => go(`/${locale}/customer/login`)} />;

    return (
        <details ref={detailsRef} className="relative">
            <summary className="account-menu-trigger flex cursor-pointer list-none items-center gap-2 rounded-lg border px-3 py-1.5 transition">
                <Avatar src={user.avatar ?? undefined} name={user.name} size={32} tooltip={false} />
                <span className="max-w-32 truncate text-sm font-medium">{user.name}</span>
                <span aria-hidden="true">▾</span>
            </summary>
            <div className="account-menu-panel absolute right-0 z-50 mt-2 w-72 rounded-xl border p-4 text-left shadow-xl transition">
                <div className="account-menu-divider flex items-center gap-3 border-b pb-3">
                    <Avatar src={user.avatar ?? undefined} name={user.name} size={48} tooltip={false} />
                    <div className="min-w-0"><p className="truncate font-semibold">{user.name}</p><p className="truncate text-sm opacity-70">{user.email}</p></div>
                </div>
                <div className="space-y-3 py-3 text-left text-sm">
                    <div>
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide opacity-60">{vi ? 'Loại tài khoản' : 'Account type'}</p>
                        <Text>{user.account_type === 'property_owner' ? (vi ? 'Chủ bất động sản' : 'Property owner') : (vi ? 'Khách hàng' : 'Customer')}</Text>
                    </div>
                    <div className="account-menu-balance rounded-lg border px-3 py-2">
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide opacity-60">{vi ? 'Số dư' : 'Balance'}</p>
                        <p className="text-lg font-semibold">{(user.wallet_balance ?? 0).toLocaleString('vi-VN')} ₫</p>
                    </div>
                </div>
                <div className="account-menu-actions grid gap-1 border-t pt-3">
                    <Button className="w-full" label={vi ? 'Thông tin tài khoản' : 'Account details'} variant="ghost" onClick={() => go(`/${locale}/customer/account`)} />
                    <Button className="w-full" label={vi ? 'Ví của tôi' : 'My wallet'} variant="ghost" onClick={() => go(`/${locale}/wallet`)} />
                    <Button className="w-full" label={vi ? 'Lịch thuê của tôi' : 'My bookings'} variant="ghost" onClick={() => go(`/${locale}/customer/bookings`)} />
                    {user.account_type === 'property_owner' ? <Button className="w-full" label={vi ? 'Đăng tin bất động sản' : 'Post property'} variant="ghost" onClick={() => go(`/${locale}/owner/properties/create`)} /> : <Button className="w-full" label={vi ? 'Trở thành chủ nhà' : 'Become an owner'} variant="ghost" onClick={() => go(`/${locale}/owner/register`)} />}
                    {user.account_type === 'property_owner' ? <Button className="w-full" label={vi ? 'Booking chủ nhà' : 'Owner bookings'} variant="ghost" onClick={() => go(`/${locale}/owner/bookings`)} /> : null}
                    <Button className="mt-1 w-full" label={vi ? 'Đăng xuất' : 'Log out'} variant="secondary" onClick={() => void logout()} />
                </div>
            </div>
        </details>
    );
}
