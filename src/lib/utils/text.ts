/**
 * Letters that Unicode decomposition leaves whole (they are distinct letters,
 * not base + accent), so stripping combining marks alone would miss them.
 */
const LETTER_FOLDS: Record<string, string> = {
	ł: 'l',
	Ł: 'L',
	ø: 'o',
	Ø: 'O',
	æ: 'ae',
	Æ: 'AE',
	œ: 'oe',
	Œ: 'OE',
	ß: 'ss',
	đ: 'd',
	Đ: 'D',
	ð: 'd',
	Ð: 'D',
	þ: 'th',
	Þ: 'Th',
	ı: 'i'
};

const FOLDABLE = new RegExp(`[${Object.keys(LETTER_FOLDS).join('')}]`, 'g');

/** "Frédérick Błoch, Kọ́lá" → "Frederick Bloch, Kola" */
export function stripDiacritics(value: string): string {
	return value
		.normalize('NFKD')
		.replace(/\p{M}+/gu, '')
		.replace(FOLDABLE, (char) => LETTER_FOLDS[char]);
}

/**
 * Case- and accent-insensitive form for substring search, so "frederick"
 * finds "Frédérick" and "bloch" finds "Błoch". Apply it to both sides.
 */
export function foldForSearch(value: string): string {
	return stripDiacritics(value).toLowerCase();
}
