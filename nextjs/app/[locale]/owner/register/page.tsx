'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { getCustomerToken } from '../../../../lib/auth';

type Application = { id: number; status: 'pending' | 'approved' | 'rejected'; owner_type: string; rejection_reason?: string | null };
const labels: Record<string, string> = { household_business: 'Hộ kinh doanh / chủ hộ', broker: 'Môi giới', company: 'Công ty' };

export default function OwnerRegisterPage() {
    const { locale = 'vi' } = useParams<{ locale: string }>();
    const router = useRouter();
    const [applications, setApplications] = useState<Application[]>([]);
    const [identityApproved, setIdentityApproved] = useState(false);
    const [ownerType, setOwnerType] = useState('');
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const timer = setTimeout(async () => {
            const token = getCustomerToken();
            if (!token) return;
            try {
                const [ownerResponse, identityResponse] = await Promise.all([
                    fetch('/api/owner-application', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
                    fetch('/api/identity-verification', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
                ]);
                const ownerResult = await ownerResponse.json();
                const identityResult = await identityResponse.json();
                setApplications(Array.isArray(ownerResult.data?.applications) ? ownerResult.data.applications : []);
                setIdentityApproved(identityResponse.ok && identityResult.data?.status === 'approved');
            } catch { setMessage('Không thể tải trạng thái hồ sơ.'); }
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const token = getCustomerToken();
        if (!token) { router.push(`/${locale}/customer/login?redirect=/${locale}/owner/register`); return; }
        setBusy(true); setMessage('');
        try {
            const response = await fetch('/api/owner-application', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: new FormData(event.currentTarget) });
            const result = await response.json();
            if (!response.ok) { setMessage(result.error ?? result.message ?? 'Không thể gửi hồ sơ.'); return; }
            const application = result.data as Application;
            setApplications((current) => [application, ...current.filter((item) => item.owner_type !== application.owner_type)]);
            setOwnerType('');
            event.currentTarget.reset();
            setMessage('Đã gửi hồ sơ. Vui lòng chờ quản trị viên duyệt.');
        } catch { setMessage('Không thể gửi hồ sơ.'); } finally { setBusy(false); }
    }

    const approvedTypes = new Set(applications.filter((item) => item.status === 'approved').map((item) => item.owner_type));
    return <main className="mx-auto w-full max-w-3xl px-4 py-10"><div className="space-y-5">
        <Heading level={2}>Đăng ký thêm tư cách tài khoản</Heading>
        <Text type="supporting">Tài khoản cá nhân và quyền xem/đặt lịch được giữ nguyên. Bạn có thể đăng ký đồng thời hộ kinh doanh, môi giới và công ty.</Text>

        {applications.length ? <div className="grid gap-3 sm:grid-cols-2">{applications.map((item) => <Card key={item.id} variant={item.status === 'approved' ? 'green' : item.status === 'rejected' ? 'red' : 'muted'} padding={4}><Heading level={4}>{labels[item.owner_type] ?? item.owner_type}</Heading><Text>{item.status === 'approved' ? 'Đã duyệt' : item.status === 'rejected' ? 'Bị từ chối' : 'Đang chờ duyệt'}</Text>{item.rejection_reason ? <Text>Lý do: {item.rejection_reason}</Text> : null}</Card>)}</div> : null}

        {!identityApproved ? <Card variant="muted" padding={4}><Text>Bạn cần xác minh CCCD cá nhân trước khi đăng ký tư cách bổ sung.</Text><div className="mt-3"><Button href={`/${locale}/customer/verify-identity?redirect=${encodeURIComponent(`/${locale}/owner/register`)}`} label="Xác minh CCCD" variant="primary" /></div></Card> : null}

        {identityApproved ? <Card variant="default" padding={5}><form onSubmit={submit} className="grid gap-4">
            <label><Text>Đăng ký với tư cách *</Text><select className="block w-full rounded-lg border bg-transparent p-2" name="owner_type" value={ownerType} onChange={(event) => setOwnerType(event.target.value)} required><option value="" disabled>Chọn loại tài khoản muốn bổ sung</option>{Object.entries(labels).map(([value, label]) => <option key={value} value={value} disabled={approvedTypes.has(value)}>{label}{approvedTypes.has(value) ? ' (đã duyệt)' : ''}</option>)}</select></label>
            {ownerType === 'company' ? <div className="grid gap-4 rounded-xl border p-4"><Heading level={4}>Thông tin công ty</Heading><label><Text>Tên công ty *</Text><input className="block w-full rounded-lg border p-2" name="company_name" required /></label><label><Text>Mã số thuế *</Text><input className="block w-full rounded-lg border p-2" name="tax_code" pattern="[0-9-]+" required /></label><label><Text>Địa chỉ trụ sở *</Text><input className="block w-full rounded-lg border p-2" name="company_address" required /></label><label><Text>Người đại diện pháp luật *</Text><input className="block w-full rounded-lg border p-2" name="legal_representative" required /></label></div> : null}
            {ownerType ? <label><Text>{ownerType === 'company' ? 'Giấy đăng ký doanh nghiệp *' : ownerType === 'broker' ? 'Chứng chỉ môi giới *' : 'Giấy tờ hộ kinh doanh / quyền sở hữu *'}</Text><input className="block w-full rounded-lg border p-2" name="ownership_document" type="file" accept="image/jpeg,image/png,application/pdf" required /></label> : null}
            <label><Text>Ghi chú</Text><textarea className="block w-full rounded-lg border p-2" name="note" rows={3} /></label>
            <Button type="submit" variant="primary" label="Gửi hồ sơ xét duyệt" isLoading={busy} />
        </form></Card> : null}
        {applications.some((item) => item.status === 'approved') ? <Button href={`/${locale}/owner/properties/create`} label="Đăng tin bất động sản" variant="primary" /> : null}
        {message ? <Text>{message}</Text> : null}
    </div></main>;
}
