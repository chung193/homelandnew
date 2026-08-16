'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Button } from '@astryxdesign/core/Button';
import { Text } from '@astryxdesign/core/Text';
import { clearCustomerSession, getAccountMode, getCustomerToken, getCustomerUser, setAccountMode, setCustomerSession, type AccountMode, type CustomerUser } from '../../lib/auth';
import type { Locale } from '../../i18n/config';

type MeResponse = { data?: CustomerUser };

export default function AccountMenu({ locale }: { locale: Locale }) {
    const router = useRouter();
    const detailsRef = useRef<HTMLDetailsElement>(null);
    const [user, setUser] = useState<CustomerUser | null>(null);
    const [accountMode, setCurrentAccountMode] = useState<AccountMode>('customer');
    const vi = locale === 'vi';

    const loadSession = useCallback(async () => {
        const token = getCustomerToken();
        const cachedUser = getCustomerUser();
        setUser(cachedUser);
        setCurrentAccountMode(getAccountMode(cachedUser));
        if (!token) return;
        try {
            const response = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` }, cache:'no-store' });
            if (response.status === 401) { clearCustomerSession(); setUser(null); return; }
            const result: MeResponse = await response.json();
            if (response.ok && result.data) { setCustomerSession({token,user:result.data}); setUser(result.data); setCurrentAccountMode(getAccountMode(result.data)); }
        } catch { /* Keep the cached profile while offline. */ }
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => void loadSession(), 0);
        const listener = () => { const nextUser = getCustomerUser(); setUser(nextUser); setCurrentAccountMode(getAccountMode(nextUser)); };
        const modeListener = () => setCurrentAccountMode(getAccountMode());
        window.addEventListener('homelend:session-changed', listener);
        window.addEventListener('homelend:account-mode-changed', modeListener);
        return () => { window.clearTimeout(timer); window.removeEventListener('homelend:session-changed', listener); window.removeEventListener('homelend:account-mode-changed', modeListener); };
    }, [loadSession]);

    function go(path: string) { detailsRef.current?.removeAttribute('open'); router.push(path); }

    function switchAccountMode() {
        if (!user || user.account_type !== 'property_owner') { go(`/${locale}/owner/register`); return; }
        const nextMode: AccountMode = accountMode === 'property_owner' ? 'customer' : 'property_owner';
        setAccountMode(nextMode, user);
        setCurrentAccountMode(nextMode);
        go(nextMode === 'property_owner' ? `/${locale}/owner/bookings` : `/${locale}`);
    }

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
                        <Text>{accountMode === 'property_owner' ? (vi ? 'Chủ bất động sản' : 'Property owner') : (vi ? 'Khách hàng' : 'Customer')}</Text>
                    </div>
                    <div className="account-menu-balance rounded-lg border px-3 py-2">
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide opacity-60">{vi ? 'Số dư' : 'Balance'}</p>
                        <p className="text-lg font-semibold">{(user.wallet_balance ?? 0).toLocaleString('vi-VN')} ₫</p>
                    </div>
                </div>
                <div className="account-menu-actions grid gap-1 border-t pt-3">
                    <Button className="mb-1 w-full" label={user.account_type === 'property_owner' ? (accountMode === 'property_owner' ? (vi ? 'Chuyển sang tài khoản khách' : 'Switch to customer') : (vi ? 'Chuyển sang tài khoản chủ nhà' : 'Switch to owner')) : (vi ? 'Trở thành chủ nhà' : 'Become an owner')} variant="secondary" onClick={switchAccountMode} />
                    <Button className="w-full" label={vi ? 'Thông tin tài khoản' : 'Account details'} variant="ghost" onClick={() => go(`/${locale}/customer/account`)} />
                    <Button className="w-full" label={vi ? 'Ví của tôi' : 'My wallet'} variant="ghost" onClick={() => go(`/${locale}/wallet`)} />
                    <Button className="w-full" label={vi ? 'Lịch thuê của tôi' : 'My bookings'} variant="ghost" onClick={() => go(`/${locale}/customer/bookings`)} />
                    {accountMode === 'property_owner' ? <Button className="w-full" label={vi ? 'Đăng tin bất động sản' : 'Post property'} variant="ghost" onClick={() => go(`/${locale}/owner/properties/create`)} /> : null}
                    {accountMode === 'property_owner' ? <Button className="w-full" label={vi ? 'Booking chủ nhà' : 'Owner bookings'} variant="ghost" onClick={() => go(`/${locale}/owner/bookings`)} /> : null}
                    <Button className="mt-1 w-full" label={vi ? 'Đăng xuất' : 'Log out'} variant="secondary" onClick={() => void logout()} />
                </div>
            </div>
        </details>
    );
}
