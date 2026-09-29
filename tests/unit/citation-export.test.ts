import { describe, expect, it } from 'vitest';
import type { CslReference } from '$lib/types/csl';
import referencesData from '$lib/data/references.json';
import {
	assignBibtexKeys,
	escapeBibtex,
	formatCslDate,
	generateBibtex,
	generateRis,
	getCslYear
} from '$lib/utils/citation-export';

const reference: CslReference = {
	id: 'example',
	type: 'article-journal',
	title: 'A 50% {test}',
	author: [{ given: 'Ada', family: 'Lovelace' }],
	issued: { 'date-parts': [[2024, 2, 9]] },
	'container-title': 'Journal of Examples',
	publisher: 'Example Press',
	page: '12-20',
	DOI: '10.1234/example',
	tags: ['AI']
};

/* Shapes taken from the Zotero export: institutions arrive as a lone `family`. */
const ministry: CslReference = {
	id: 'ministry',
	type: 'report',
	title: 'Kenya National AI Strategy',
	author: [{ family: 'Ministry of Information, Communications & The Digital Economy', given: '' }],
	issued: { 'date-parts': [[2025]] }
};

const commission: CslReference = {
	id: 'commission',
	type: 'document',
	title: 'DRAFT resolution',
	author: [{ family: "African Commission on Human and Peoples' Rights", given: '' }],
	issued: { 'date-parts': [[2025]] }
};

describe('citation exports', () => {
	it('formats partial CSL dates and safely escapes BibTeX', () => {
		expect(formatCslDate(reference.issued)).toBe('2024-02-09');
		expect(getCslYear(reference.issued)).toBe('2024');
		expect(escapeBibtex('50% {test}')).toBe('50\\% \\{test\\}');
	});

	it('produces BibTeX and RIS records with standard terminators', () => {
		const bibtex = generateBibtex([reference]);
		const ris = generateRis([reference]);

		expect(bibtex).toContain('@article{Lovelace2024A,');
		expect(bibtex).toContain('title = {A 50\\% \\{test\\}}');
		expect(ris).toContain('TY  - JOUR');
		expect(ris).toContain('DA  - 2024/02/09');
		expect(ris).toMatch(/ER {2}- $/);
	});
});

describe('BibTeX keys', () => {
	it('keeps keys to ASCII letters and digits', () => {
		const keys = assignBibtexKeys([
			ministry,
			commission,
			{ id: 'b', type: 'book', title: 'Décoloniser', author: [{ family: 'Błoch', given: 'A' }] },
			{ id: 'o', type: 'book', title: "L'archive", author: [{ family: "O'Connell", given: 'S' }] }
		]);

		expect(keys).toEqual([
			'MinistryofInformationCommunicationsTheDigitalEconomy2025Kenya',
			'AfricanCommissiononHumanandPeoplesRights2025DRAFT',
			'BlochndDecoloniser',
			'OConnellndLarchive'
		]);
		for (const key of keys) expect(key).toMatch(/^[A-Za-z0-9]+$/);
	});

	it('disambiguates colliding keys so no entry is dropped as a duplicate', () => {
		const twin = (id: string, title: string): CslReference => ({
			id,
			type: 'article-journal',
			title,
			author: [{ family: 'Adams', given: 'R' }],
			issued: { 'date-parts': [[2024]] }
		});
		const keys = assignBibtexKeys([
			twin('1', 'The first'),
			twin('2', 'Unrelated'),
			twin('3', 'The second'),
			twin('4', 'The third')
		]);

		expect(keys).toEqual(['Adams2024Thea', 'Adams2024Unrelated', 'Adams2024Theb', 'Adams2024Thec']);
		expect(generateBibtex([twin('1', 'The first'), twin('3', 'The second')])).toContain(
			'@article{Adams2024Theb,'
		);
	});

	it('gives every record in the real bibliography a distinct, valid key', () => {
		const keys = assignBibtexKeys(referencesData as unknown as CslReference[]);

		expect(new Set(keys).size).toBe(keys.length);
		for (const key of keys) expect(key).toMatch(/^[A-Za-z0-9]+$/);
	});

	it('never reuses a key that already exists naturally', () => {
		const ref = (id: string, title: string): CslReference => ({
			id,
			type: 'book',
			title,
			author: [{ family: 'Kim', given: 'J' }],
			issued: { 'date-parts': [[2020]] }
		});
		const keys = assignBibtexKeys([ref('1', 'Ab'), ref('2', 'Ab'), ref('3', 'Aba')]);

		expect(new Set(keys).size).toBe(3);
		expect(keys).toEqual(['Kim2020Abb', 'Kim2020Abc', 'Kim2020Aba']);
	});
});

describe('institutional authors', () => {
	it('braces and escapes single-field names in BibTeX', () => {
		const bibtex = generateBibtex([ministry, commission]);

		expect(bibtex).toContain(
			'author = {{Ministry of Information, Communications \\& The Digital Economy}}'
		);
		expect(bibtex).toContain("author = {{African Commission on Human and Peoples' Rights}}");
	});

	it('writes single-field names to RIS without a dangling comma', () => {
		const ris = generateRis([commission]);

		expect(ris).toContain("AU  - African Commission on Human and Peoples' Rights\n");
		expect(ris).not.toMatch(/AU {2}- .*, $/m);
	});

	it('splits RIS page ranges on en dashes as well as hyphens', () => {
		const ris = generateRis([{ ...reference, page: '112–130' }]);

		expect(ris).toContain('SP  - 112');
		expect(ris).toContain('EP  - 130');
	});
});
