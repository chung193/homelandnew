import type { Metadata } from 'next';
import { getMessages } from '../../../../i18n/messages';
import { isLocale } from '../../../../i18n/config';
import OwnerBookingsClient from './OwnerBookingsClient';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale } = await params;
    const messages = getMessages(isLocale(locale) ? locale : 'vi');
    return { title: messages.ownerBookingsTitle };
}

export default function OwnerBookingsPage() {
    return <OwnerBookingsClient />;
}
