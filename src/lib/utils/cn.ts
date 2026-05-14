/**
 * Tiny classname joiner for NativeWind.
 * Usage: `cn('flex-1', condition && 'bg-l-accent', otherClasses)`.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
