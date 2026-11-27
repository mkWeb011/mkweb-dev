import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url';
import { dataset, projectId } from './env';

/**
 * Build Sanity CDN image URLs: urlFor(image).width(1200).url()
 * The CDN resizes, crops (respecting the editor's hotspot) and converts
 * to WebP/AVIF with .auto('format') — this replaces next/image optimisation,
 * which a static export cannot use.
 *
 * Note: @sanity/image-url v2 uses the NAMED export createImageUrlBuilder
 * (v1 had a default export — old tutorials still show that).
 */
const builder = createImageUrlBuilder({ projectId: projectId || 'placeholder', dataset });

export function urlFor(source: SanityImageSource) {
  return builder.image(source).auto('format').fit('max');
}
