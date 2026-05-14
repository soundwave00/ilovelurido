import { supabase } from '@/lib/supabase';
import { mapReviewHelpfulRow, mapReviewReplyRow, mapReviewRow } from '@/lib/utils/rowMappers';
import type { Review, ReviewHelpful, ReviewReply } from '@/types/domain';

export async function fetchReviews(luridoId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('lurido_id', luridoId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r: Record<string, unknown>) => mapReviewRow(r));
}

export interface CreateReviewInput {
  luridoId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  body?: string;
  photoUrl?: string;
}

export async function createReview(input: CreateReviewInput, userId: string): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      lurido_id: input.luridoId,
      user_id: userId,
      stars: input.stars,
      body: input.body ?? null,
      photo_url: input.photoUrl ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapReviewRow(data as Record<string, unknown>);
}

export async function deleteReview(id: string): Promise<void> {
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchReviewReplies(reviewId: string): Promise<ReviewReply[]> {
  const { data, error } = await supabase
    .from('review_replies')
    .select('*')
    .eq('review_id', reviewId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: Record<string, unknown>) => mapReviewReplyRow(r));
}

export async function createReviewReply(
  reviewId: string,
  body: string,
  userId: string,
): Promise<ReviewReply> {
  const { data, error } = await supabase
    .from('review_replies')
    .insert({ review_id: reviewId, user_id: userId, body })
    .select()
    .single();
  if (error) throw error;
  return mapReviewReplyRow(data as Record<string, unknown>);
}

export async function fetchHelpfulVotes(reviewId: string): Promise<ReviewHelpful[]> {
  const { data, error } = await supabase
    .from('review_helpful')
    .select('*')
    .eq('review_id', reviewId);
  if (error) throw error;
  return (data ?? []).map((r: Record<string, unknown>) => mapReviewHelpfulRow(r));
}

export async function toggleHelpful(reviewId: string, userId: string, voted: boolean): Promise<void> {
  if (voted) {
    const { error } = await supabase
      .from('review_helpful')
      .delete()
      .eq('review_id', reviewId)
      .eq('user_id', userId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('review_helpful')
      .insert({ review_id: reviewId, user_id: userId });
    if (error) throw error;
  }
}
