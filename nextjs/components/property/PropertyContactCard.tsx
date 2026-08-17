'use client';

import { useState } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';

type Owner = { name?: string | null; avatar?: string | null; phone?: string | null };

function maskedPhone(phone: string) {
    return phone.length > 6 ? `${phone.slice(0, 6)} ***` : phone;
}

export default function PropertyContactCard({ owner, locale }: { owner?: Owner; locale: 'vi' | 'en' }) {
    const [revealed, setRevealed] = useState(false);
    const vi = locale === 'vi';
    const phone = owner?.phone?.trim() ?? '';
    const zaloPhone = phone.replace(/^\+84/, '0').replace(/\D/g, '');

    return <div className="space-y-4 lg:sticky lg:top-24">
        <Card variant="default" padding={4} elevation="low">
            <div className="flex items-center gap-3 border-b pb-4">
                {owner?.avatar ? <img src={owner.avatar} alt="" className="size-12 rounded-full object-cover" /> : <span className="grid size-12 place-items-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700">{owner?.name?.charAt(0).toUpperCase() || 'H'}</span>}
                <div><Heading level={4}>{owner?.name || (vi ? 'Người đăng tin' : 'Property owner')}</Heading><Text type="supporting">{vi ? 'Chủ bất động sản đã xác thực' : 'Verified property owner'}</Text></div>
            </div>
            <div className="mt-4 grid gap-3">
                {phone ? <>
                    <a href={`https://zalo.me/${zaloPhone}`} target="_blank" rel="noreferrer" className="rounded-lg border px-4 py-3 text-center font-semibold transition hover:border-blue-500 hover:text-blue-600">{vi ? 'Chat qua Zalo' : 'Chat via Zalo'}</a>
                    <a href={`tel:${phone}`} onClick={() => setRevealed(true)} className="rounded-lg bg-emerald-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-emerald-700">☎ {revealed ? phone : `${maskedPhone(phone)} · ${vi ? 'Hiện số' : 'Show'}`}</a>
                </> : <Text type="supporting">{vi ? 'Người đăng chưa cập nhật số điện thoại.' : 'The owner has not added a phone number.'}</Text>}
            </div>
        </Card>
        <Card variant="muted" padding={4}><div className="flex gap-3"><span className="text-2xl text-amber-500">⚠</span><Text type="supporting">{vi ? 'Không chuyển tiền hoặc đặt cọc trước khi xem nhà, xác minh thông tin và gặp trực tiếp người đăng.' : 'Do not transfer money or pay a deposit before viewing and verifying the property.'}</Text></div></Card>
    </div>;
}
