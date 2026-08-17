'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { getCustomerToken, setCustomerSession, type CustomerUser } from '../../../../lib/auth';

const inputClass = 'min-w-0 rounded-lg border border-zinc-300 bg-transparent px-3 py-2';

export default function ProfileForm({ user, onUserChange }: { user: CustomerUser; onUserChange: (user: CustomerUser) => void }) {
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const token = getCustomerToken();
        if (!token) return;
        setBusy(true);
        setMessage('');
        try {
            const response = await fetch('/api/auth/me', { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: new FormData(event.currentTarget) });
            const result = await response.json();
            const updated = result.data?.user;
            if (!response.ok || !updated) {
                setMessage(result.error ?? result.message ?? 'Không thể cập nhật hồ sơ.');
                return;
            }
            onUserChange(updated);
            setCustomerSession({ token, user: updated });
            setMessage('Đã cập nhật thông tin tài khoản.');
        } catch {
            setMessage('Không thể cập nhật hồ sơ.');
        } finally {
            setBusy(false);
        }
    }

    return <Card variant="default" padding={5}><VStack gap={3}>
        <Heading level={3}>Thông tin cá nhân</Heading>
        <form key={`${user.id}-${user.email}-${user.avatar ?? ''}`} onSubmit={submit} className="grid min-w-0 gap-3 md:grid-cols-2">
            <label className="grid min-w-0 gap-1"><Text>Họ và tên</Text><input className={inputClass} name="name" defaultValue={user.name} required /></label>
            <label className="grid min-w-0 gap-1"><Text>Email</Text><input className={inputClass} name="email" type="email" defaultValue={user.email} required /></label>
            <label className="grid min-w-0 gap-1"><Text>Số điện thoại *</Text><input className={inputClass} name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0912345678" pattern="(?:\+84|0)[0-9]{9}" defaultValue={user.detail?.phone ?? ''} required /></label>
            <label className="grid min-w-0 gap-1"><Text>Thành phố</Text><input className={inputClass} name="city" defaultValue={user.detail?.city ?? ''} /></label>
            <label className="grid min-w-0 gap-1 md:col-span-2"><Text>Địa chỉ</Text><input className={inputClass} name="address" defaultValue={user.detail?.address ?? ''} /></label>
            <label className="grid min-w-0 gap-1"><Text>Ngày sinh</Text><input className={inputClass} name="birthday" type="date" defaultValue={user.detail?.birthday?.slice(0, 10) ?? ''} /></label>
            <label className="grid min-w-0 gap-1"><Text>Ảnh đại diện</Text><input className={inputClass} name="avatar" type="file" accept="image/jpeg,image/png,image/webp" /></label>
            <label className="grid min-w-0 gap-1 md:col-span-2"><Text>Giới thiệu</Text><textarea className={inputClass} name="description" rows={4} defaultValue={user.detail?.description ?? ''} /></label>
            <div className="md:col-span-2"><Button type="submit" label="Lưu thay đổi" variant="primary" isLoading={busy} /></div>
        </form>
        {message ? <Text>{message}</Text> : null}
    </VStack></Card>;
}
