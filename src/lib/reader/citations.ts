import type { MarkdownIt, StateCore, Token } from 'markdown-it';

/**
 * Turns the paper's plain-text Chicago author-date citations into links to its
 * own reference list, without altering a character of the visible text.
 *
 * The paper is converted from .docx, where the Zotero field codes had already
 * been flattened, so there are no machine-readable citation keys to work from —
 * only strings like `(Barringer et al. 2014, 6)` and a `## References` section.
 * This module reads that section, indexes it by surname and year, and rewrites
 * matching spans in the body into `<a href="#bib-slug">`. Anything it cannot
 * match with confidence is left as plain text and reported, so an author-side
 * mismatch shows up as a build warning rather than a wrong link.
 */

export interface BibEntry {
	/** 1-based position in the reference list. */
	position: number;
	/** Fragment target, e.g. `barringer-2014`. Unique within the paper. */
	slug: string;
	/** Year plus any disambiguating letter, e.g. `2018a`. */
	year: string;
	/** Normalised forms the leading name of a citation may take. */
	nameKeys: Set<string>;
	/** Every capitalised name in the entry, for checking co-author names. */
	allNames: Set<string>;
}

/** A citation the matcher could not resolve, or resolved only partly. */
export interface CitationIssue {
	/** The citation text as it appears in the paper. */
	text: string;
	reason: 'no-match' | 'ambiguous' | 'partial-author-match';
	/** For `partial-author-match`, the entry that was linked anyway. */
	slug?: string;
	/** Co-author names present in the citation but absent from the entry. */
	unmatchedNames?: string[];
}

export interface CitationReport {
	/** Distinct citation spans that became links. */
	linked: number;
	issues: CitationIssue[];
}

/**
 * Fold away case, diacritics, modifier letters, and the possessive `'s` that a
 * narrative mention attaches to the surname — "Nyamnjoh's invitation (2017)"
 * has to resolve to the same key as the reference entry's "Nyamnjoh".
 */
function foldName(value: string): string {
	return value
		.replace(/['’ʼ]s$/u, '')
		.normalize('NFD')
		.replace(/\p{M}+/gu, '')
		.toLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, '');
}

function slugify(value: string): string {
	return (
		value
			.normalize('NFD')
			.replace(/\p{M}+/gu, '')
			.toLowerCase()
			.replace(/[^\p{L}\p{N}]+/gu, '-')
			.replace(/^-+|-+$/g, '') || 'ref'
	);
}

/**
 * The year that closes the author block of a reference entry: `. 2014.`, or
 * `. 2018a.` where Chicago disambiguates two works from the same year. Initials
 * ("Sarah C.") and `eds.` mean the preceding period is not a reliable boundary,
 * so the year itself is the anchor.
 */
const ENTRY_YEAR = /\.\s*((?:1[89]|20)\d{2})([a-z])?\./;

/** Words that begin capitalised but are never surnames in an author block. */
const NAME_STOPWORDS = new Set(['and', 'et', 'al', 'eds', 'ed', 'with', 'de', 'van', 'der']);

function capitalisedNames(value: string): string[] {
	// `\p{Lu}` misses names whose first letter carries a combining mark, so match
	// on a word boundary and test the folded form instead.
	const words = value.match(/[\p{L}][\p{L}\p{M}'’ʿ-]*/gu) ?? [];
	return words.filter((w) => {
		const folded = foldName(w);
		if (folded.length < 2 || NAME_STOPWORDS.has(folded)) return false;
		// Keep only words that start with an uppercase letter once marks are gone.
		const bare = w.normalize('NFD').replace(/\p{M}+/gu, '');
		return bare[0] === bare[0].toUpperCase() && bare[0] !== bare[0].toLowerCase();
	});
}

/** Build the index from the raw source of each reference-list paragraph. */
export function parseBibliography(entryTexts: string[]): BibEntry[] {
	const entries: BibEntry[] = [];
	const usedSlugs = new Set<string>();

	entryTexts.forEach((raw, i) => {
		const match = ENTRY_YEAR.exec(raw);
		if (!match) return;

		const [, year, suffix] = match;
		const authorBlock = raw
			.slice(0, match.index)
			.replace(/,?\s*eds?\.?$/i, '')
			.trim();

		// Chicago inverts only the first author, so everything up to the first
		// comma is that author's family name — one word for most, several for
		// corporate authors ("African Union") and names that are not inverted.
		const leadName = (authorBlock.split(',')[0] ?? authorBlock).trim();

		const nameKeys = new Set<string>();
		const addKey = (v: string) => {
			const folded = foldName(v);
			if (folded.length >= 2) nameKeys.add(folded);
		};
		addKey(leadName);
		// An in-text citation may shorten a multi-word lead name to any one of its
		// words ("Khalīfa" for "Khalīfa Muḥammad ʿUmar"). The year has to match
		// too, so the extra keys do not loosen matching in practice.
		for (const word of capitalisedNames(leadName)) addKey(word);

		const allNames = new Set(capitalisedNames(authorBlock).map(foldName));

		let slug = `${slugify(leadName)}-${year}${suffix ?? ''}`;
		if (usedSlugs.has(slug)) {
			let n = 2;
			while (usedSlugs.has(`${slug}-${n}`)) n++;
			slug = `${slug}-${n}`;
		}
		usedSlugs.add(slug);

		entries.push({
			position: i + 1,
			slug,
			year: `${year}${suffix ?? ''}`,
			nameKeys,
			allNames
		});
	});

	return entries;
}

interface Match {
	entry: BibEntry;
	issue?: CitationIssue;
}

/** Resolve a `names` + `year` pair against the index. */
function findEntry(
	entries: BibEntry[],
	names: string[],
	year: string,
	rawText: string
): Match | null {
	const lead = names[0] ? foldName(names[0]) : '';
	// Without a name there is nothing to disambiguate on, and a parenthesised
	// year is at least as often a plain date — "the Black Orpheus Revisited
	// project (2025)" — as a citation. Refuse rather than guess.
	if (!lead) return null;

	const candidates = entries.filter((e) => e.year === year && e.nameKeys.has(lead));

	if (candidates.length === 0) return null;

	if (candidates.length > 1) {
		// More than one work fits. Co-author names can still separate them.
		const rest = names.slice(1).map(foldName).filter(Boolean);
		const narrowed = rest.length
			? candidates.filter((e) => rest.every((n) => e.allNames.has(n)))
			: candidates;
		if (narrowed.length !== 1) {
			return { entry: candidates[0], issue: { text: rawText, reason: 'ambiguous' } };
		}
		return { entry: narrowed[0] };
	}

	const entry = candidates[0];
	const missing = names
		.slice(1)
		.filter((n) => n && !entry.allNames.has(foldName(n)))
		.map((n) => n.trim());
	if (missing.length) {
		return {
			entry,
			issue: {
				text: rawText,
				reason: 'partial-author-match',
				slug: entry.slug,
				unmatchedNames: missing
			}
		};
	}
	return { entry };
}

/**
 * One citation inside a parenthesised group: an optional author list, a year,
 * and an optional locator. The locator is itself sometimes a second year, which
 * Chicago uses to cite two works by the same authors — `(Carroll et al. 2020,
 * 2021)` — so it is captured separately rather than swallowed.
 */
const CITATION_PART =
	/^\s*(?<names>[^\d]*?)\s*(?<year>(?:1[89]|20)\d{2}[a-z]?)(?<tail>\s*,\s*(?<locator>[^;]+))?\s*$/u;

/**
 * Signal phrases that introduce a citation — "(see, for example, Gikunda
 * 2023)". They sit where the first author's name would be, so they have to come
 * off before the name list is split.
 */
const SIGNAL_PHRASE =
	/^(?:see\s+also|see|cf\.?|compare|for\s+example|for\s+instance|e\.?\s*g\.?|i\.?\s*e\.?|especially|esp\.?|notably|but\s+see|among\s+others|also|reviewed\s+in|discussed\s+in|summarised\s+in)\b[\s,;:]*/i;

/**
 * Split an author list into individual names, and report how many leading
 * characters were signal phrase rather than name — the link must start at the
 * name so the rendered text reads "(see, for example, [Gikunda 2023])".
 */
function splitNames(names: string): { names: string[]; offset: number } {
	let head = names;
	for (;;) {
		const next = head.replace(SIGNAL_PHRASE, '');
		if (next === head) break;
		head = next;
	}
	const offset = names.length - head.length;

	return {
		offset,
		names: head
			.replace(/\bet\s+al\.?/gi, '')
			.split(/,\s*|\s+and\s+|\s*&\s*/)
			.map((n) => n.trim())
			.filter(Boolean)
	};
}

interface Span {
	/** Offset within the text token. */
	start: number;
	end: number;
	slug: string;
}

/**
 * Find every linkable citation span in one run of text. `recent` is the plain
 * text that preceded it, used to attribute a bare `(2005, 10)` to the surname
 * mentioned earlier in the sentence.
 */
function findSpans(
	text: string,
	entries: BibEntry[],
	recent: string,
	issues: CitationIssue[]
): Span[] {
	const spans: Span[] = [];
	// Parenthesised groups containing a year. Nested parentheses do not occur in
	// citations, so a non-greedy scan between single parens is enough.
	const groupRe = /\(([^()]*\b(?:1[89]|20)\d{2}[a-z]?\b[^()]*)\)/gu;

	for (const group of text.matchAll(groupRe)) {
		const inner = group[1];
		const innerStart = group.index + 1;
		// Everything read up to this citation — the earlier tokens plus the part of
		// this one that precedes it. A bare year needs the surname that came just
		// before it, which is often in the same text run.
		const context = recent + text.slice(0, group.index);

		let cursor = 0;
		for (const part of inner.split(';')) {
			const partStart = innerStart + cursor;
			cursor += part.length + 1; // +1 for the ';' consumed by split

			const m = CITATION_PART.exec(part);
			if (!m?.groups) continue;

			const { names: rawNames = '', year, locator } = m.groups;
			const { names, offset: signalOffset } = splitNames(rawNames);

			// A bare year takes its author from the preceding prose.
			const resolvedNames = names.length ? names : lookBack(context, year, entries);

			const found = findEntry(entries, resolvedNames, year, part.trim());
			if (!found) {
				// A parenthesised year with no explicit or nearby matching author is
				// usually a publication date ("the project (2025)"), not a broken
				// citation. Leave it as prose without turning an intentional refusal
				// to guess into a noisy build warning.
				if (names.length > 0 || resolvedNames.length > 0) {
					issues.push({ text: part.trim(), reason: 'no-match' });
				}
				continue;
			}
			if (found.issue) issues.push(found.issue);

			// `(Carroll et al. 2020, 2021)` is two works: link the first citation up
			// to its year, then treat the trailing year as a second citation with
			// the same authors. A page locator stays inside the first link.
			const locatorIsYear = locator ? /^(?:1[89]|20)\d{2}[a-z]?$/.test(locator.trim()) : false;

			const partOffsetInText = partStart;
			const yearEndInPart = (m.index ?? 0) + m[0].indexOf(year) + year.length;
			// The name begins after the part's own leading whitespace and after any
			// signal phrase that preceded it.
			const nameStart = part.length - part.trimStart().length + signalOffset;

			if (locatorIsYear) {
				spans.push({
					start: partOffsetInText + nameStart,
					end: partOffsetInText + yearEndInPart,
					slug: found.entry.slug
				});
				const second = findEntry(entries, resolvedNames, locator!.trim(), part.trim());
				if (second) {
					const at = part.indexOf(locator!.trim(), yearEndInPart);
					spans.push({
						start: partOffsetInText + at,
						end: partOffsetInText + at + locator!.trim().length,
						slug: second.entry.slug
					});
				}
			} else {
				spans.push({
					start: partOffsetInText + nameStart,
					end: partOffsetInText + part.trimEnd().length,
					slug: found.entry.slug
				});
			}
		}
	}

	return spans.sort((a, b) => a.start - b.start);
}

/**
 * Nearest preceding surname that matches an entry with this year.
 *
 * Bounded to the last 300 characters deliberately: `(2025)` after "the Black
 * Orpheus Revisited project" is a publication date, not a citation, and a wide
 * window would eventually reach some unrelated 2025 surname and link it. A
 * narrative citation puts the name in the same clause, so a short window is
 * both sufficient and much safer than a generous one.
 */
function lookBack(context: string, year: string, entries: BibEntry[]): string[] {
	const words = capitalisedNames(context.slice(-300));
	for (let i = words.length - 1; i >= 0; i--) {
		const folded = foldName(words[i]);
		if (entries.some((e) => e.year === year && e.nameKeys.has(folded))) return [words[i]];
	}
	return [];
}

/**
 * markdown-it plugin. Runs last in the core chain, so it sees the final text of
 * every token (after linkify and smartquotes) and can locate the reference list
 * among the block tokens.
 */
export function createCitationRule(onReport?: (_report: CitationReport) => void) {
	return function citationPlugin(md: MarkdownIt): void {
		md.core.ruler.push('citations', (state: StateCore) => {
			const tokens = state.tokens;

			// --- locate the reference list -----------------------------------
			let refStart = -1;
			let refEnd = tokens.length;
			for (let i = 0; i < tokens.length; i++) {
				const t = tokens[i];
				if (
					refStart === -1 &&
					t.type === 'heading_open' &&
					tokens[i + 1]?.content.trim().toLowerCase() === 'references'
				) {
					refStart = i;
					continue;
				}
				if (refStart !== -1 && (t.type === 'footnote_block_open' || t.type === 'heading_open')) {
					refEnd = i;
					break;
				}
			}
			if (refStart === -1) return;

			// --- index it, and anchor each entry -----------------------------
			const entryTexts: string[] = [];
			const paragraphOpens: Token[] = [];
			for (let i = refStart; i < refEnd; i++) {
				if (tokens[i].type !== 'paragraph_open') continue;
				const inline = tokens[i + 1];
				if (inline?.type !== 'inline') continue;
				paragraphOpens.push(tokens[i]);
				entryTexts.push(inline.content);
			}

			const entries = parseBibliography(entryTexts);
			entries.forEach((entry) => {
				const el = paragraphOpens[entry.position - 1];
				el.attrSet('id', `bib-${entry.slug}`);
				el.attrJoin('class', 'reader-bib-entry');
			});
			if (entries.length === 0) return;

			// --- link citations in the body ----------------------------------
			const issues: CitationIssue[] = [];
			let linked = 0;
			// Plain text seen so far, for resolving bare years.
			let recent = '';

			for (let i = 0; i < tokens.length; i++) {
				if (i >= refStart && i < refEnd) continue;
				const token = tokens[i];
				if (token.type !== 'inline' || !token.children) continue;
				// Headings carry no citations and must stay plain for the TOC.
				if (tokens[i - 1]?.type === 'heading_open') {
					recent = '';
					continue;
				}

				const rebuilt: Token[] = [];
				let insideLink = 0;

				for (const child of token.children) {
					if (child.type === 'link_open') insideLink++;
					if (child.type === 'link_close') insideLink--;

					if (child.type !== 'text' || insideLink > 0 || !child.content) {
						// Still counts as read text: a bare year may look back past a
						// link for its surname. Trimmed to keep the buffer cheap.
						if (child.content) recent = (recent + child.content).slice(-600);
						rebuilt.push(child);
						continue;
					}

					const spans = findSpans(child.content, entries, recent, issues);
					recent = (recent + child.content).slice(-600);

					if (spans.length === 0) {
						rebuilt.push(child);
						continue;
					}

					let cursor = 0;
					for (const span of spans) {
						if (span.start < cursor) continue; // overlapping match, skip
						if (span.start > cursor) {
							const before = new state.Token('text', '', 0);
							before.content = child.content.slice(cursor, span.start);
							rebuilt.push(before);
						}

						const open = new state.Token('link_open', 'a', 1);
						open.attrSet('href', `#bib-${span.slug}`);
						open.attrSet('class', 'reader-citation');
						open.attrSet('data-cite', span.slug);
						rebuilt.push(open);

						const label = new state.Token('text', '', 0);
						label.content = child.content.slice(span.start, span.end);
						rebuilt.push(label);

						rebuilt.push(new state.Token('link_close', 'a', -1));
						cursor = span.end;
						linked++;
					}

					if (cursor < child.content.length) {
						const after = new state.Token('text', '', 0);
						after.content = child.content.slice(cursor);
						rebuilt.push(after);
					}
				}

				token.children = rebuilt;
			}

			onReport?.({ linked, issues });
		});
	};
}
