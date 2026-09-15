import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { ImageResponse } from 'next/og';

import { BRAND_COLORS } from '@/lib/brand-colors';

interface OgCardProps {
  title: string;
  description: string;
}

/* The size every social network crops from; anything else gets letterboxed by them. */
export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = 'image/png';

const ASSETS = path.join(process.cwd(), 'src/assets');

const MASCOT_SIZE = 400;

/* Latin and Cyrillic ship as separate subsets, so they are separate families here and the list below falls through per glyph. */
const FONT_FILES = [
  { name: 'Montserrat', file: 'montserrat-latin-400-normal.woff', weight: 400 },
  { name: 'Montserrat', file: 'montserrat-latin-700-normal.woff', weight: 700 },
  { name: 'Montserrat Cyrillic', file: 'montserrat-cyrillic-400-normal.woff', weight: 400 },
  { name: 'Montserrat Cyrillic', file: 'montserrat-cyrillic-700-normal.woff', weight: 700 },
] as const;

const FONT_FAMILY = 'Montserrat, "Montserrat Cyrillic"';

/* The character travels inline: the generator rasterises an SVG it can read in the markup, not one it would have to fetch. */
const readMascot = async (): Promise<string> => {
  const svg = await readFile(path.join(ASSETS, 'mushroom-neutral.svg'));

  return `data:image/svg+xml;base64,${svg.toString('base64')}`;
};

const readFonts = async () =>
  Promise.all(
    FONT_FILES.map(async ({ name, file, weight }) => ({
      name,
      weight,
      style: 'normal' as const,
      data: await readFile(path.join(ASSETS, 'fonts', file)),
    })),
  );

/* The share card: what the page is about on the left, who says it on the right. */
export const renderOgCard = async ({ title, description }: OgCardProps): Promise<ImageResponse> => {
  const [mascot, fonts] = await Promise.all([readMascot(), readFonts()]);

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '64px 72px',
        background: BRAND_COLORS.background,
        color: BRAND_COLORS.foreground,
        fontFamily: FONT_FAMILY,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingRight: 48 }}>
        <div style={{ display: 'flex', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em' }}>
          <span style={{ color: BRAND_COLORS.brand }}>Open</span>
          <span>&nbsp;Mushroom</span>
        </div>
        <div style={{ display: 'flex', fontSize: 58, fontWeight: 700, lineHeight: 1.08, marginTop: 40 }}>{title}</div>
        <div style={{ display: 'flex', fontSize: 28, lineHeight: 1.4, marginTop: 24, color: BRAND_COLORS.muted }}>
          {description}
        </div>
        <div style={{ display: 'flex', fontSize: 24, marginTop: 40, color: BRAND_COLORS.muted }}>
          npm install open-mushroom
        </div>
      </div>
      {/* The generator paints a bitmap rather than a page, so the framework's image component has nothing to optimise here. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={mascot} width={MASCOT_SIZE} height={MASCOT_SIZE} alt="" />
    </div>,
    { ...OG_SIZE, fonts },
  );
};
