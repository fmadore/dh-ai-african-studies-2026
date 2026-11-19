import type { PositionPaperMeta } from '#lib/reader/types';
import type { ScholarlyMetaOptions } from '#lib/utils/seo';

/**
 * Scholarly meta / JSON-LD options for the position paper. The landing page
 * and the reader differ only in the URLs they advertise; everything else is
 * the shared bibliographic record. The SEO builders read only the fields they
 * know, so the record's extra keys (PDF path, authorship note) are ignored.
 */
export function paperScholarlyOptions(
	meta: PositionPaperMeta,
	urls: Pick<ScholarlyMetaOptions, 'abstractUrl' | 'fullTextUrl'>
): ScholarlyMetaOptions {
	return { ...meta, ...urls };
}
