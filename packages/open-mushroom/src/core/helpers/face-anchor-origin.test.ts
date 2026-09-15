import { describe, expect, it } from 'vitest';

import { faceToViewBox } from './face-anchor-origin';

describe('faceToViewBox', () => {
  it('maps a face-space point through the face layout', () => {
    expect(faceToViewBox({ x: 500, y: 400 }, { translate: { x: 40, y: 180 }, scale: 0.5 })).toEqual({ x: 290, y: 380 });
  });

  it('rounds to a tenth', () => {
    expect(faceToViewBox({ x: 1, y: 1 }, { translate: { x: 0, y: 0 }, scale: 0.333 })).toEqual({ x: 0.3, y: 0.3 });
  });
});
