import { Pipe, PipeTransform } from '@angular/core';

/**
 * Resolves asset URLs stored in Supabase.
 *
 * - Full URLs (http/https): returned as-is
 * - data: URLs (base64):    returned as-is
 * - Paths starting with '/': leading slash stripped so they become relative
 *   and resolve correctly against Angular's <base href> (e.g. /spiritualimagination/)
 * - Everything else:        returned as-is
 */
@Pipe({
  name: 'assetUrl',
  standalone: true,
  pure: true
})
export class AssetUrlPipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) return '';
    if (value.startsWith('http') || value.startsWith('data:')) {
      return value;
    }
    // Strip leading slash → becomes relative to <base href>
    if (value.startsWith('/')) {
      return value.slice(1);
    }
    return value;
  }
}
