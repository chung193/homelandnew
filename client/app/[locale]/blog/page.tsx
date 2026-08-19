import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@astryxdesign/core/Badge';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { isLocale, type Locale } from '../../../i18n/config';

type PageProps = { params: Promise<{ locale: string }>; searchParams: Promise<{ page?: string }> };
type Post = {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    avatar?: string | null;
    type: string;
    published_at?: string | null;
    user?: { name?: string };
    category?: { name?: string };
};
type PostResponse = { data?: Post[]; meta?: { current_page?: number; last_page?: number } };

const API_BASE_URL = process.env.BE_API_URL ?? process.env.NEXT_PUBLIC_BE_API_URL ?? 'http://127.0.0.1:8000/api';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale } = await params;
    return { title: isLocale(locale) && locale === 'en' ? 'Blog' : 'Bài viết' };
}

export default async function BlogPage({ params, searchParams }: PageProps) {
    const { locale: routeLocale } = await params;
    const { page: rawPage } = await searchParams;
    const locale: Locale = isLocale(routeLocale) ? routeLocale : 'vi';
    const page = Math.max(1, Number(rawPage) || 1);
    const vi = locale === 'vi';
    let posts: Post[] = [];
    let lastPage = 1;
    let error = '';

    try {
        const response = await fetch(`${API_BASE_URL}/v1/client/post?page=${page}&per_page=12`, { cache: 'no-store' });
        if (!response.ok) throw new Error();
        const result: PostResponse = await response.json();
        posts = result.data ?? [];
        lastPage = result.meta?.last_page ?? 1;
    } catch {
        error = vi ? 'Không thể tải danh sách bài viết.' : 'Could not load posts.';
    }

    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 md:px-8 md:py-12">
            <VStack gap={4}>
                <HStack justify="between" align="center" gap={3} wrap="wrap">
                    <VStack gap={1}>
                        <Heading level={2}>{vi ? 'Blog bất động sản' : 'Property blog'}</Heading>
                        <Text type="supporting">{vi ? 'Tin tức, kinh nghiệm và kiến thức hữu ích.' : 'News, guides, and useful insights.'}</Text>
                    </VStack>
                    <Link className="font-medium underline" href={`/${locale}`}>{vi ? 'Về trang chủ' : 'Home'}</Link>
                </HStack>
                {error ? <Card variant="red" padding={4}><Text>{error}</Text></Card> : null}
                {!error ? (
                    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {posts.map((post) => (
                            <Card key={post.id} variant="default" padding={4} elevation="low">
                                <VStack gap={3}>
                                    {post.avatar ? <img src={post.avatar} alt={post.name} className="h-48 w-full rounded-xl object-cover" /> : null}
                                    <HStack justify="between" align="start" gap={2}>
                                        <Heading level={4}>{post.name}</Heading>
                                        <Badge variant="info" label={post.type} />
                                    </HStack>
                                    <Text type="supporting">{post.description || (vi ? 'Đang cập nhật nội dung.' : 'Content coming soon.')}</Text>
                                    <Text type="supporting">{post.category?.name ?? ''}{post.user?.name ? ` · ${post.user.name}` : ''}</Text>
                                </VStack>
                            </Card>
                        ))}
                    </section>
                ) : null}
                {!error && posts.length === 0 ? <Card variant="muted" padding={4}><Text>{vi ? 'Chưa có bài viết.' : 'No posts yet.'}</Text></Card> : null}
                <HStack justify="between" align="center" gap={2}>
                    {page > 1 ? <Link className="font-medium underline" href={`/${locale}/blog?page=${page - 1}`}>{vi ? 'Trang trước' : 'Previous'}</Link> : <span />}
                    {page < lastPage ? <Link className="font-medium underline" href={`/${locale}/blog?page=${page + 1}`}>{vi ? 'Trang sau' : 'Next'}</Link> : null}
                </HStack>
            </VStack>
        </main>
    );
}
