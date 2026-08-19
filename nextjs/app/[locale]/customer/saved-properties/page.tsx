import { notFound } from 'next/navigation';
import { isLocale } from '../../../../i18n/config';
import SavedPropertiesClient from './SavedPropertiesClient';

export default async function SavedPropertiesPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    if (!isLocale(locale)) notFound();
    return <SavedPropertiesClient locale={locale} />;
}
