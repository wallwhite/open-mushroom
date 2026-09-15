import sharpImage from 'sharp';

/* Pixel-level comparison helpers for the skeleton gates. */
export interface Raster {
  data: Buffer;
  width: number;
  height: number;
}

/* Neither ink nor white, so both count as content when measuring coverage. */
export const BACKGROUND = '#7fbf7f';
const BACKGROUND_RGB = [0x7f, 0xbf, 0x7f] as const;

export const CHANNELS = 3;
const DIFF_THRESHOLD = 96;

export const rasterize = async (svg: string): Promise<Raster> => {
  const { data, info } = await sharpImage(Buffer.from(svg))
    .flatten({ background: BACKGROUND })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return { data, width: info.width, height: info.height };
};

const channelsDiffer = (a: Buffer, b: Buffer, pixel: number): boolean => {
  const offset = pixel * CHANNELS;

  for (let c = 0; c < CHANNELS; c += 1) {
    if (Math.abs((a[offset + c] ?? 0) - (b[offset + c] ?? 0)) > DIFF_THRESHOLD) return true;
  }

  return false;
};

export const diffMask = (a: Raster, b: Raster): Uint8Array => {
  const mask = new Uint8Array(a.width * a.height);

  for (let i = 0; i < mask.length; i += 1) mask[i] = channelsDiffer(a.data, b.data, i) ? 1 : 0;

  return mask;
};

/* Pixels that differ from the background colour. */
export const contentMask = (raster: Raster): Uint8Array => {
  const background = Buffer.alloc(raster.data.length);

  for (let i = 0; i < background.length; i += 1) background[i] = BACKGROUND_RGB[i % CHANNELS] ?? 0;

  return diffMask(raster, { data: background, width: raster.width, height: raster.height });
};

export const countMask = (mask: Uint8Array): number => mask.reduce<number>((sum, bit) => sum + bit, 0);

const neighboursOf = (index: number, width: number, height: number): number[] => {
  const x = index % width;
  const y = (index - x) / width;

  return [
    x > 0 ? index - 1 : -1,
    x < width - 1 ? index + 1 : -1,
    y > 0 ? index - width : -1,
    y < height - 1 ? index + width : -1,
  ].filter((next) => next >= 0);
};

/* Largest 4-connected component of the mask, in pixels. */
export const largestBlob = (mask: Uint8Array, width: number, height: number): number => {
  const seen = new Uint8Array(mask.length);
  const stack = new Int32Array(mask.length);
  const componentSize = (start: number): number => {
    let size = 0;
    let top = 1;

    stack[0] = start;
    seen[start] = 1;
    while (top > 0) {
      top -= 1;
      const index = stack[top] ?? 0;

      size += 1;
      for (const next of neighboursOf(index, width, height)) {
        if (mask[next] === 1 && seen[next] === 0) {
          seen[next] = 1;
          stack[top] = next;
          top += 1;
        }
      }
    }

    return size;
  };
  let largest = 0;

  for (const [start, element] of mask.entries()) {
    if (element === 1 && seen[start] === 0) largest = Math.max(largest, componentSize(start));
  }

  return largest;
};

/* Grey copy of `original` with the diff mask painted red. */
export const diffOverlay = (original: Raster, diff: Uint8Array): Buffer => {
  const overlay = Buffer.alloc(original.data.length);

  for (const [i, element] of diff.entries()) {
    const offset = i * CHANNELS;

    if (element === 1) {
      overlay[offset] = 0xff;
      overlay[offset + 1] = 0;
      overlay[offset + 2] = 0;
    } else {
      const gray = 0x60 + Math.floor((original.data[offset] ?? 0) / 2);

      overlay[offset] = gray;
      overlay[offset + 1] = gray;
      overlay[offset + 2] = gray;
    }
  }

  return overlay;
};
