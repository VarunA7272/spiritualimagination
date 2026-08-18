import { Pipe, PipeTransform } from '@angular/core';

/**
 * Resolves and optimizes asset URLs.
 *
 * - Cloudinary URLs: auto-injects q_auto,f_auto (and optional width) so every
 *   image is served compressed, in WebP/AVIF format, resized to display size.
 * - Full http/https URLs (non-Cloudinary): returned as-is
 * - data: URLs (base64): returned as-is
 * - Paths starting with '/': leading slash stripped
 *
 * Usage:
 *   {{ imageUrl | assetUrl }}        → q_auto + f_auto (no resize)
 *   {{ imageUrl | assetUrl:400 }}    → q_auto + f_auto + 400px wide
 */
@Pipe({
  name: 'assetUrl',
  standalone: true,
  pure: true
})
export class AssetUrlPipe implements PipeTransform {
  transform(value: string | undefined | null, width?: number): string {
    if (!value) return '';
    if (value.startsWith('data:')) return value;

    // Inject Cloudinary transformations for CDN-hosted images
    if (value.includes('res.cloudinary.com')) {
      return this.addCloudinaryTransforms(value, width);
    }

    if (value.startsWith('http')) return value;

    // Strip leading slash → becomes relative to <base href>
    if (value.startsWith('/')) return value.slice(1);

    return value;
  }

  private addCloudinaryTransforms(url: string, width?: number): string {
    // Cloudinary URL format:
    // https://res.cloudinary.com/<cloud>/image/upload/<transforms>/v.../filename
    // We inject transforms right after /upload/
    const uploadMarker = '/upload/';
    const idx = url.indexOf(uploadMarker);
    if (idx === -1) return url;

    const before = url.slice(0, idx + uploadMarker.length);
    const after = url.slice(idx + uploadMarker.length);

    // Skip if transforms already injected (starts with f_, q_, w_, c_, g_)
    if (/^[fqwcg]_/.test(after)) return url;

    const transforms = width ? `f_auto,q_auto,w_${width}/` : `f_auto,q_auto/`;
    return before + transforms + after;
  }
}
