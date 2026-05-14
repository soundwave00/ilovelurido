// Formatters — distanza, tempo relativo, orari, open-now.

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY_MS = 24 * HOUR;

export function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  if (diff < 2 * MINUTE) return 'ora';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}min fa`;
  if (diff < 2 * HOUR) return '1h fa';
  if (diff < DAY_MS) return `${Math.floor(diff / HOUR)}h fa`;
  if (diff < 2 * DAY_MS) return 'ieri';
  return `${Math.floor(diff / DAY_MS)}g fa`;
}

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
type DayKey = (typeof DAY_KEYS)[number];
type Hours = Partial<Record<DayKey, [string, string]>>;

function toMinutes(t: string): number {
  const parts = t.split(':');
  const h = Number(parts[0] ?? '0');
  const m = Number(parts[1] ?? '0');
  return h * 60 + m;
}

function todayKey(): DayKey {
  const idx = new Date().getDay();
  return DAY_KEYS[idx] as DayKey;
}

export function isOpenNow(hours: Hours | null | undefined): boolean {
  if (!hours) return false;
  const slot = hours[todayKey()];
  if (!slot) return false;
  const openMin = toMinutes(slot[0]);
  const closeMin = toMinutes(slot[1]);
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  if (closeMin < openMin) {
    return nowMin >= openMin || nowMin < closeMin;
  }
  return nowMin >= openMin && nowMin < closeMin;
}

export function formatCloseTime(hours: Hours | null | undefined): string | null {
  if (!hours) return null;
  const slot = hours[todayKey()];
  return slot?.[1] ?? null;
}

const DAY_LABELS: Record<DayKey, string> = {
  mon: 'Lun',
  tue: 'Mar',
  wed: 'Mer',
  thu: 'Gio',
  fri: 'Ven',
  sat: 'Sab',
  sun: 'Dom',
};

export function formatHoursLine(hours: Hours | null | undefined): string {
  if (!hours) return 'orari non disponibili';
  const entries = (Object.keys(hours) as DayKey[]).map((k) => {
    const slot = hours[k];
    return slot ? `${DAY_LABELS[k]} ${slot[0]}–${slot[1]}` : null;
  }).filter(Boolean);
  return entries.join(' · ') || 'orari non disponibili';
}
