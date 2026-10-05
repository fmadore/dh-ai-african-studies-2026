import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	existsSync: vi.fn(),
	readdir: vi.fn(),
	readFile: vi.fn(),
	parse: vi.fn()
}));
vi.mock('node:fs', () => ({ existsSync: mocks.existsSync }));
vi.mock('node:fs/promises', () => ({ readdir: mocks.readdir, readFile: mocks.readFile }));
vi.mock('exifr', () => ({ default: { parse: mocks.parse } }));

beforeEach(() => {
	vi.resetModules();
	Object.values(mocks).forEach((mock) => mock.mockReset());
	mocks.existsSync.mockReturnValue(true);
	mocks.readFile.mockImplementation(async (path: string) => Buffer.from(path));
});

describe('build-time photo index', () => {
	it('shares in-flight scans and bounds simultaneous EXIF work', async () => {
		const files = Array.from({ length: 11 }, (_, index) => `20260218_${index}.jpg`);
		mocks.readdir.mockResolvedValue(files);
		let active = 0;
		let peak = 0;
		mocks.parse.mockImplementation(async () => {
			active++;
			peak = Math.max(peak, active);
			await Promise.resolve();
			active--;
			return null;
		});
		const { loadWorkshopPhotos } = await import('$lib/server/photos');
		const first = loadWorkshopPhotos();
		const second = loadWorkshopPhotos();
		expect(first).toBe(second);
		const photos = await first;
		expect(photos).toHaveLength(files.length);
		expect(peak).toBeGreaterThan(1);
		expect(peak).toBeLessThanOrEqual(4);
		expect(mocks.readdir).toHaveBeenCalledTimes(1);
		expect(mocks.readFile).toHaveBeenCalledTimes(files.length);
		expect(await loadWorkshopPhotos()).toBe(photos);
	});

	it('uses local EXIF dates and rotation, with a filename fallback for malformed metadata', async () => {
		mocks.readdir.mockResolvedValue([
			'20260220_phone.jpg',
			'camera.jpg',
			'unrelated.jpg',
			'notes.txt'
		]);
		mocks.parse.mockImplementation(async (buffer: Buffer) => {
			// The mocked buffer is the joined path, with `\` separators on Windows
			if (!/[\\/]camera\.jpg$/.test(buffer.toString())) throw new Error('Malformed EXIF');
			return {
				DateTimeOriginal: new Date(2026, 1, 18, 0, 15),
				ExifImageWidth: 4000,
				ExifImageHeight: 3000,
				Orientation: 6
			};
		});
		const { loadWorkshopPhotos } = await import('$lib/server/photos');
		const photos = await loadWorkshopPhotos();
		expect(photos.map((photo) => [photo.id, photo.category])).toEqual([
			['camera', 'Day 1'],
			['20260220_phone', 'Day 3']
		]);
		expect(photos[0]).toMatchObject({ width: 3000, height: 4000 });
		expect(mocks.readFile).toHaveBeenCalledTimes(3);
	});

	it('allows a failed directory scan to be retried', async () => {
		mocks.readdir
			.mockRejectedValueOnce(new Error('Temporary filesystem error'))
			.mockResolvedValueOnce([]);
		const { loadWorkshopPhotos } = await import('$lib/server/photos');
		await expect(loadWorkshopPhotos()).rejects.toThrow('Temporary filesystem error');
		await expect(loadWorkshopPhotos()).resolves.toEqual([]);
		expect(mocks.readdir).toHaveBeenCalledTimes(2);
	});

	it('handles empty samples and rejects invalid sample counts', async () => {
		const { loadPhotoSample } = await import('$lib/server/photos');
		await expect(loadPhotoSample(0)).resolves.toEqual([]);
		for (const count of [-1, 1.5, Infinity])
			await expect(loadPhotoSample(count)).rejects.toThrow(RangeError);
		expect(mocks.readdir).not.toHaveBeenCalled();
	});
});
