import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '@/lib/supabase';

const MAX_SIDE_PX = 1600;
const QUALITY = 0.82;

type Bucket = 'avatars' | 'lurido-photos' | 'review-photos';

export async function uploadImage(
  uri: string,
  bucket: Bucket,
  path: string,
): Promise<string> {
  // 1. Comprimi
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_SIDE_PX } }],
    { compress: QUALITY, format: ImageManipulator.SaveFormat.JPEG },
  );

  // 2. Leggi come blob
  const response = await fetch(result.uri);
  const blob = await response.blob();
  const arrayBuffer = await new Response(blob).arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // 3. Upload
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, uint8Array, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) throw error;

  // 4. Ritorna URL pubblico
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function buildStoragePath(userId: string, filename: string): string {
  return `${userId}/${Date.now()}_${filename}`;
}
