'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import type { Locale } from '../../i18n/config';
import { getCustomerToken } from '../../lib/auth';

type Review = { id: number; rating: number; comment?: string | null; created_at: string; user?: { name?: string } };
type ReviewsResponse = { data?: { reviews?: Review[]; average_rating?: number; review_count?: number }; error?: string };

export default function ReviewPanel({ propertyId, locale, listingType }: { propertyId: string; locale: Locale; listingType: string }) {
    const vi = locale === 'vi';
    const [reviews, setReviews] = useState<Review[]>([]);
    const [average, setAverage] = useState(0);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [eligible,setEligible]=useState(false);
    const [eligibilityChecked,setEligibilityChecked]=useState(false);

    const loadReviews = useCallback(async () => {
        try {
            const response = await fetch(`/api/properties/${propertyId}/reviews`, { cache: 'no-store' });
            const result: ReviewsResponse = await response.json();
            setReviews(result.data?.reviews ?? []);
            setAverage(result.data?.average_rating ?? 0);
        } catch {
            setFeedback(vi ? 'Không thể tải đánh giá.' : 'Could not load reviews.');
        }
    }, [propertyId, vi]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => void loadReviews(), 0);
        return () => window.clearTimeout(timeoutId);
    }, [loadReviews]);

    useEffect(()=>{const timeoutId=window.setTimeout(async()=>{const token=getCustomerToken();if(!token){setEligibilityChecked(true);return}try{const response=await fetch(`/api/properties/${propertyId}/review-eligibility`,{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});const result=await response.json();setEligible(response.ok&&Boolean(result.data?.eligible))}finally{setEligibilityChecked(true)}},0);return()=>window.clearTimeout(timeoutId)},[propertyId]);

    async function submitReview() {
        const token = getCustomerToken();
        if (!token) {
            setFeedback(vi ? 'Vui lòng đăng nhập để đánh giá.' : 'Please log in to review.');
            return;
        }

        setSubmitting(true);
        setFeedback('');
        try {
            const response = await fetch(`/api/properties/${propertyId}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ rating, comment: comment.trim() || null }),
            });
            const result = await response.json();
            if (!response.ok) {
                setFeedback(response.status === 403
                    ? (vi ? 'Bạn chỉ có thể đánh giá sau khi hoàn tất kỳ thuê.' : 'You can review after a completed stay.')
                    : (result.error ?? (vi ? 'Không thể gửi đánh giá.' : 'Could not submit review.')));
                return;
            }
            setFeedback(vi ? 'Đã lưu đánh giá.' : 'Review saved.');
            setComment('');
            await loadReviews();
        } catch {
            setFeedback(vi ? 'Không thể gửi đánh giá.' : 'Could not submit review.');
        } finally {
            setSubmitting(false);
        }
    }

    if (listingType !== 'rent') return null;

    return (
        <Card variant="default" padding={4} elevation="low">
            <VStack gap={3}>
                <HStack justify="between" align="center" gap={2} wrap="wrap">
                    <Heading level={4}>{vi ? 'Đánh giá từ khách thuê' : 'Guest reviews'}</Heading>
                    <Text>{average > 0 ? `★ ${average}/5 (${reviews.length})` : (vi ? 'Chưa có đánh giá' : 'No reviews yet')}</Text>
                </HStack>
                {reviews.map((review) => (
                    <Card key={review.id} variant="muted" padding={3}>
                        <VStack gap={1}>
                            <Text><strong>{review.user?.name ?? (vi ? 'Khách thuê' : 'Guest')}</strong> · {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</Text>
                            {review.comment ? <Text>{review.comment}</Text> : null}
                        </VStack>
                    </Card>
                ))}
                {eligible?<VStack gap={2}>
                    <Text><strong>{vi ? 'Viết đánh giá' : 'Write a review'}</strong></Text>
                    <select value={rating} onChange={(event) => setRating(Number(event.target.value))} className="rounded-lg border border-zinc-300 px-3 py-2">
                        {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} / 5</option>)}
                    </select>
                    <textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={2000} rows={4} className="rounded-lg border border-zinc-300 px-3 py-2" placeholder={vi ? 'Chia sẻ trải nghiệm của bạn' : 'Share your experience'} />
                    <Button label={vi ? 'Gửi đánh giá' : 'Submit review'} variant="primary" isLoading={submitting} onClick={() => void submitReview()} />
                    {feedback ? <Text type="supporting">{feedback}</Text> : null}
                </VStack>:eligibilityChecked?<Card variant="muted" padding={3}><Text type="supporting">{getCustomerToken()?(vi?'Bạn chỉ có thể đánh giá sau khi booking đã được xác nhận hoàn thành.':'You can review only after the booking is completed.'):(vi?'Đăng nhập để kiểm tra quyền đánh giá của bạn.':'Log in to check your review eligibility.')}</Text></Card>:null}
            </VStack>
        </Card>
    );
}
