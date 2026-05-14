import { supabase } from '@/lib/supabase';
import { mapPhotoRow } from '@/lib/utils/rowMappers';
import type { Photo } from '@/types/domain';

export async function fetchPhotos(luridoId: string): Promise<Photo[]> {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('lurido_id', luridoId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: Record<string, unknown>) => mapPhotoRow(r));
}

export async function createPhoto(
  luridoId: string,
  url: string,
  userId: string,
  options?: { caption?: string; sortOrder?: number; blurhash?: string },
): Promise<Photo> {
  const { data, error } = await supabase
    .from('photos')
    .insert({
      lurido_id: luridoId,
      user_id: userId,
      url,
      caption: options?.caption ?? null,
      sort_order: options?.sortOrder ?? 0,
      blurhash: options?.blurhash ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapPhotoRow(data as Record<string, unknown>);
}

export async function deletePhoto(id: string): Promise<void> {
  const { error } = await supabase.from('photos').delete().eq('id', id);
  if (error) throw error;
}
