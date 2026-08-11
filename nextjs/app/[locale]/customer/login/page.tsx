'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { getMessages } from '../../../../i18n/messages';
import { isLocale, type Locale } from '../../../../i18n/config';
import { setCustomerSession } from '../../../../lib/auth';
import type { CustomerUser } from '../../../../lib/auth';

type LoginPayload = {
    email: string;
    password: string;
};

type LoginResponse = {
    data?: {
        token?: string;
        user?: CustomerUser;
    };
    error?: string;
};

export default function CustomerLoginPage() {
    const router = useRouter();
    const params = useParams<{ locale: string }>();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const locale = useMemo<Locale>(() => {
        const fallback = 'vi';
        const localeFromRoute = params.locale ?? fallback;
        return isLocale(localeFromRoute) ? localeFromRoute : fallback;
    }, [params.locale]);

    const messages = getMessages(locale);

    const redirectTarget = searchParams.get('redirect') ?? `/${locale}`;
    const googleLoginUrl = process.env.NEXT_PUBLIC_GOOGLE_LOGIN_URL;

    async function handleLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');

        const payload: LoginPayload = {
            email,
            password,
        };

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result: LoginResponse = await response.json();

            if (!response.ok || !result.data?.token) {
                setErrorMessage(result.error ?? messages.loginFailed);
                return;
            }

            setCustomerSession({ token: result.data.token, user: result.data.user });
            router.push(redirectTarget);
        } catch {
            setErrorMessage(messages.loginFailed);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-10 md:px-8">
            <Card variant="default" padding={5} elevation="low">
                <VStack gap={4}>
                    <Heading level={2}>{messages.loginTitle}</Heading>
                    <Text type="supporting">{messages.bookingRequiresLogin}</Text>

                    <form onSubmit={handleLogin} className="flex flex-col gap-3">
                        <label className="flex flex-col gap-1">
                            <Text>{messages.emailLabel}</Text>
                            <input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                                className="rounded-lg border border-zinc-300 px-3 py-2"
                            />
                        </label>

                        <label className="flex flex-col gap-1">
                            <Text>{messages.passwordLabel}</Text>
                            <input
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                                className="rounded-lg border border-zinc-300 px-3 py-2"
                            />
                        </label>

                        <Button label={messages.loginAction} variant="primary" type="submit" isLoading={isSubmitting} />
                    </form>

                    {errorMessage ? <Text>{errorMessage}</Text> : null}

                    <HStack gap={2} wrap="wrap" align="center">
                        <Button
                            label={messages.loginWithGoogle}
                            variant="secondary"
                            onClick={() => {
                                if (googleLoginUrl) {
                                    window.location.href = googleLoginUrl;
                                }
                            }}
                            isDisabled={!googleLoginUrl}
                        />
                        <Button
                            label={messages.createAccountAction}
                            variant="ghost"
                            onClick={() => {
                                router.push(`/${locale}/customer/register?redirect=${encodeURIComponent(redirectTarget)}`);
                            }}
                        />
                    </HStack>
                </VStack>
            </Card>
        </main>
    );
}
