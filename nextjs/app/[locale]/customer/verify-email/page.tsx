import Link from 'next/link';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { isLocale, type Locale } from '../../../../i18n/config';

type PageProps = {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ url?: string }>;
};

type VerifyResponse = { message?: string };

const API_BASE_URL =
    process.env.BE_API_URL ?? process.env.NEXT_PUBLIC_BE_API_URL ?? 'http://127.0.0.1:8000/api';

function isAllowedVerificationUrl(value: string): boolean {
    try {
        const candidate = new URL(value);
        const backend = new URL(API_BASE_URL);
        return candidate.origin === backend.origin && candidate.pathname.startsWith('/api/v1/auth/email/verify/');
    } catch {
        return false;
    }
}

export default async function VerifyEmailPage({ params, searchParams }: PageProps) {
    const { locale: routeLocale } = await params;
    const { url } = await searchParams;
    const locale: Locale = isLocale(routeLocale) ? routeLocale : 'vi';
    let success = false;
    let message = locale === 'vi' ? 'Liên kết xác thực không hợp lệ.' : 'The verification link is invalid.';

    if (url && isAllowedVerificationUrl(url)) {
        try {
            const response = await fetch(url, { cache: 'no-store' });
            const result: VerifyResponse = await response.json();
            success = response.ok;
            message = result.message ?? (success
                ? (locale === 'vi' ? 'Xác thực email thành công.' : 'Email verified successfully.')
                : message);
        } catch {
            message = locale === 'vi'
                ? 'Không thể kết nối tới dịch vụ xác thực.'
                : 'Could not connect to the verification service.';
        }
    }

    return (
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-10 md:px-8">
            <Card variant="default" padding={5} elevation="low">
                <VStack gap={3}>
                    <Heading level={2}>
                        {success
                            ? (locale === 'vi' ? 'Email đã được xác thực' : 'Email verified')
                            : (locale === 'vi' ? 'Không thể xác thực email' : 'Email verification failed')}
                    </Heading>
                    <Text>{message}</Text>
                    <Link className="font-medium underline" href={`/${locale}/customer/login`}>
                        {locale === 'vi' ? 'Đi tới đăng nhập' : 'Go to login'}
                    </Link>
                </VStack>
            </Card>
        </main>
    );
}
