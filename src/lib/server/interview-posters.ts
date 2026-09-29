/**
 * Build-time lookup of self-hosted interview posters.
 *
 * `npm run optimize:images` saves each video's poster as
 * static/images/interviews/<youtubeId>.webp. Pages use that copy when it
 * exists, so they make no request to YouTube before a visitor presses play;
 * an interview added since the last run falls back to YouTube's thumbnail.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';

export function interviewPosterPath(youtubeId: string): string | undefined {
	const path = `/images/interviews/${youtubeId}.webp`;
	return existsSync(join(process.cwd(), 'static', path)) ? path : undefined;
}

/** youtubeId → static path, for every interview that has a local poster. */
export function interviewPosters(youtubeIds: string[]): Record<string, string> {
	return Object.fromEntries(
		youtubeIds.flatMap((id) => {
			const path = interviewPosterPath(id);
			return path ? [[id, path]] : [];
		})
	);
}
