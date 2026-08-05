/**
 * Generates the Open Graph / social card image at
 * `static/images/og-image.jpg` (1200x630).
 *
 * The same file serves two surfaces: the `og:image` on every page of the site
 * (wired up in `src/lib/utils/seo.ts`) and the repository's social preview on
 * GitHub, which has to be uploaded by hand — there is no REST API for it.
 *
 * Typography note: this renders through sharp, which draws text with pango and
 * can therefore only use fonts installed on the system — it cannot read the
 * webfonts in `node_modules/@fontsource-variable/`, which ship as woff2 that
 * FreeType will not load. `Century Gothic` is the closest installed stand-in
 * for the site's display face (Outfit): both are geometric sans with circular
 * bowls and a single-storey `a`. To render with the real thing, pass a path to
 * a TTF/OTF build of Outfit:
 *
 *   node scripts/make_og_image.mjs --fontfile path/to/Outfit.ttf
 *
 * Re-run after changing the source photo, the wording, or the theme colours.
 */

import sharp from 'sharp';
import { stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const WIDTH = 1200;
const HEIGHT = 630;

/** Crop offset from the top of the 1920x1280 source, in source pixels. */
const CROP_TOP = 140;

const SOURCE_PHOTO = path.join(root, 'static/images/photos/3V7A0288.jpg');
const OUTPUT = path.join(root, 'static/images/og-image.jpg');

// --color-secondary-300 / -400 from src/app.css.
const TEAL_BRIGHT = '#5eead4';
const INK = '#08181c';

const args = process.argv.slice(2);
const fontfileArg = args.indexOf('--fontfile');
const fontfile = fontfileArg === -1 ? undefined : args[fontfileArg + 1];
const fontArg = args.indexOf('--font');
const font = fontArg === -1 ? 'Century Gothic' : args[fontArg + 1];

/**
 * Renders one line of text to an RGBA buffer.
 *
 * dpi is pinned to 72 so that one pango point equals one pixel, which makes
 * `px` below a real pixel em size rather than something to be converted.
 */
async function line(text, { px, color, weight = 'normal', tracking = 0, width = 1040 }) {
	const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	const attrs = [
		`size="${Math.round(px * 1024)}"`,
		`foreground="${color}"`,
		`weight="${weight}"`,
		tracking ? `letter_spacing="${Math.round(tracking * 1024)}"` : ''
	]
		.filter(Boolean)
		.join(' ');

	const input = {
		text: `<span ${attrs}>${escaped}</span>`,
		rgba: true,
		dpi: 72,
		width,
		wrap: 'word'
	};
	if (fontfile) input.fontfile = fontfile;
	else input.font = font;

	const buffer = await sharp({ text: input }).png().toBuffer();
	const { width: w, height: h } = await sharp(buffer).metadata();
	return { buffer, width: w, height: h };
}

/** Darkens the photo enough for white text to clear WCAG AA on the left half. */
function scrim() {
	return Buffer.from(`
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sweep" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%"   stop-color="${INK}" stop-opacity="0.94" />
          <stop offset="40%"  stop-color="${INK}" stop-opacity="0.74" />
          <stop offset="100%" stop-color="${INK}" stop-opacity="0.26" />
        </linearGradient>
        <linearGradient id="foot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="${INK}" stop-opacity="0" />
          <stop offset="100%" stop-color="${INK}" stop-opacity="0.55" />
        </linearGradient>
      </defs>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#sweep)" />
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#foot)" />
    </svg>
  `);
}

/** The short teal rule that sits above the eyebrow, echoing `.section-head`. */
function rule(x, y) {
	return {
		input: Buffer.from(
			`<svg width="64" height="4" xmlns="http://www.w3.org/2000/svg">
         <rect width="64" height="4" rx="2" fill="${TEAL_BRIGHT}" />
       </svg>`
		),
		left: x,
		top: y
	};
}

const PAD_X = 76;

// The scrim is a cool ink wash, which leaves the photo looking muddy at this
// opacity; the modest saturation lift puts the colour back.
const photo = await sharp(SOURCE_PHOTO)
	.extract({ left: 0, top: CROP_TOP, width: 1920, height: 1008 })
	.resize(WIDTH, HEIGHT, { fit: 'cover' })
	.modulate({ saturation: 1.14, brightness: 1.02 })
	.toBuffer();

const eyebrow = await line('18–20 FEBRUARY 2026 · HANOVER, GERMANY', {
	px: 21,
	color: TEAL_BRIGHT,
	weight: 'bold',
	tracking: 2.6
});
const title = await line('Charting New Territory', {
	px: 78,
	color: '#ffffff',
	weight: 'bold',
	width: 1000
});
const subtitle = await line('Digital Humanities and AI in African Studies', {
	px: 37,
	color: '#e2f4f1',
	width: 940
});
const footer = await line('fmadore.github.io/dh-ai-african-studies-2026', {
	px: 20,
	color: '#9fc4c0',
	tracking: 0.6
});

// Lay the block out from the bottom up so the title always sits the same
// distance above the footer regardless of how the lines wrap.
const footerTop = HEIGHT - 56 - footer.height;
const subtitleTop = footerTop - 34 - subtitle.height;
const titleTop = subtitleTop - 16 - title.height;
const eyebrowTop = titleTop - 22 - eyebrow.height;
const ruleTop = eyebrowTop - 26;

await sharp(photo)
	.composite([
		{ input: scrim() },
		rule(PAD_X, ruleTop),
		{ input: eyebrow.buffer, left: PAD_X, top: eyebrowTop },
		{ input: title.buffer, left: PAD_X, top: titleTop },
		{ input: subtitle.buffer, left: PAD_X, top: subtitleTop },
		{ input: footer.buffer, left: PAD_X, top: footerTop }
	])
	.jpeg({ quality: 88, mozjpeg: true })
	.toFile(OUTPUT);

const out = await sharp(OUTPUT).metadata();
const { size } = await stat(OUTPUT);
console.log(
	`Wrote ${path.relative(root, OUTPUT)} — ${out.width}x${out.height}, ` +
		`${(size / 1024).toFixed(0)} KB, font: ${fontfile ?? font}`
);
