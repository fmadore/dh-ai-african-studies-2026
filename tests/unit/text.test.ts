import { describe, expect, it } from 'vitest';
import { foldForSearch, stripDiacritics } from '$lib/utils/text';
import { filterReferences } from '$lib/utils/references';

describe('text folding', () => {
	it('strips accents, including letters that do not decompose', () => {
		expect(stripDiacritics('Frédérick Błoch')).toBe('Frederick Bloch');
		expect(stripDiacritics('Kọ́lá Túbọ̀ṣún')).toBe('Kola Tubosun');
		expect(stripDiacritics('Øresund, Straße, Æsir')).toBe('Oresund, Strasse, AEsir');
	});

	it('matches regardless of case and accents on either side', () => {
		expect(foldForSearch('Érika Melek Delgado')).toContain(foldForSearch('erika'));
		expect(foldForSearch('Yaoundé')).toContain(foldForSearch('YAOUNDE'));
		expect(foldForSearch('Sénégal')).toContain(foldForSearch('sénégal'));
	});

	it('lets the bibliography search ignore accents', () => {
		const refs = [
			{ id: 'a', type: 'book', title: 'Du Bénin au Sénégal', author: [{ family: 'Ngom' }] },
			{ id: 'b', type: 'book', title: 'Other', author: [{ family: 'Błoch', given: 'Agata' }] }
		];
		const search = (searchQuery: string) =>
			filterReferences(refs, {
				searchQuery,
				selectedTypes: [],
				selectedYears: [],
				selectedTags: [],
				selectedLanguages: []
			}).map((ref) => ref.id);

		expect(search('benin')).toEqual(['a']);
		expect(search('bloch')).toEqual(['b']);
		expect(search('  senegal ')).toEqual(['a']);
	});
});
