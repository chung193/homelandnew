'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { getMessages } from '../../../../i18n/messages';
import { isLocale, type Locale } from '../../../../i18n/config';

type RegisterResponse = {
    data?: {
        token?: string;
        user?: unknown;
    };
    error?: string;
};

export default function CustomerRegisterPage() {
    const router = useRouter();
    const params = useParams<{ locale: string }>();
    const searchParams = useSearchParams();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [accountType, setAccountType] = useState('individual');
    const [accountTypes, setAccountTypes] = useState<Array<{code:string;name:string}>>([]);
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const locale = useMemo<Locale>(() => {
        const fallback = 'vi';
        const localeFromRoute = params.locale ?? fallback;
        return isLocale(localeFromRoute) ? localeFromRoute : fallback;
    }, [params.locale]);

    const messages = getMessages(locale);
    const redirectTarget = searchParams.get('redirect') ?? `/${locale}`;
    const googleLoginUrl = process.env.NEXT_PUBLIC_GOOGLE_LOGIN_URL;

    useEffect(()=>{const timer=setTimeout(async()=>{try{const response=await fetch('/api/account-types',{cache:'no-store'});const result=await response.json();const items=Array.isArray(result.data)?result.data:[];setAccountTypes(items);if(items.length&&!items.some((item:{code:string})=>item.code===accountType))setAccountType(items[0].code)}catch{/* Registration will show the default option. */}},0);return()=>clearTimeout(timer)},[accountType]);

    async function handleRegister(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    account_type: accountType,
                    password,
                    password_confirmation: passwordConfirmation,
                }),
            });

            const result: RegisterResponse = await response.json();

            if (!response.ok) {
                setErrorMessage(result.error ?? messages.registerFailed);
                return;
            }

            setSuccessMessage(messages.verifyEmailNotice);
            setTimeout(() => {
                router.push(`/${locale}/customer/login?redirect=${encodeURIComponent(redirectTarget)}`);
            }, 800);
        } catch {
            setErrorMessage(messages.registerFailed);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-10 md:px-8">
            <Card variant="default" padding={5} elevation="low">
                <VStack gap={4}>
                    <Heading level={2}>{messages.registerTitle}</Heading>

                    <form onSubmit={handleRegister} className="flex flex-col gap-3">
                        <label className="flex flex-col gap-1">
                            <Text>{messages.nameLabel}</Text>
                            <input
                                type="text"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                required
                                className="rounded-lg border border-zinc-300 px-3 py-2"
                            />
                        </label>

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
                            <Text>{locale === 'vi' ? 'Loại tài khoản' : 'Account type'}</Text>
                            <select
                                value={accountType}
                                onChange={(event) => setAccountType(event.target.value)}
                                required
                                className="rounded-lg border border-zinc-300 px-3 py-2"
                            >
                                {(accountTypes.length?accountTypes:[{code:'individual',name:locale==='vi'?'Cá nhân':'Individual'}]).map(item=><option key={item.code} value={item.code}>{item.name}</option>)}
                            </select>
                            <Text type="supporting">{locale === 'vi' ? 'Bạn cần gửi giấy tờ tương ứng và được admin duyệt trước khi sử dụng các chức năng yêu cầu xác minh.' : 'Documents and admin approval are required for verified actions.'}</Text>
                        </label>

                        <label className="flex flex-col gap-1">
                            <Text>{messages.passwordLabel}</Text>
                            <input
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                minLength={8}
                                required
                                className="rounded-lg border border-zinc-300 px-3 py-2"
                            />
                        </label>

                        <label className="flex flex-col gap-1">
                            <Text>{messages.passwordConfirmLabel}</Text>
                            <input
                                type="password"
                                value={passwordConfirmation}
                                onChange={(event) => setPasswordConfirmation(event.target.value)}
                                minLength={8}
                                required
                                className="rounded-lg border border-zinc-300 px-3 py-2"
                            />
                        </label>

                        <Button label={messages.registerAction} variant="primary" type="submit" isLoading={isSubmitting} />
                    </form>

                    {errorMessage ? <Text>{errorMessage}</Text> : null}
                    {successMessage ? <Text>{successMessage}</Text> : null}

                    <HStack gap={2} wrap="wrap" align="center">
                        <Button
                            label={messages.loginAction}
                            variant="secondary"
                            onClick={() => {
                                router.push(`/${locale}/customer/login?redirect=${encodeURIComponent(redirectTarget)}`);
                            }}
                        />
                        <Button
                            label={messages.loginWithGoogle}
                            variant="ghost"
                            isDisabled={!googleLoginUrl}
                            onClick={() => {
                                if (googleLoginUrl) {
                                    window.location.href = googleLoginUrl;
                                }
                            }}
                        />
                    </HStack>
                </VStack>
            </Card>
        </main>
    );
}
