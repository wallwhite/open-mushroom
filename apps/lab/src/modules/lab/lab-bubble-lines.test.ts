import { describe, expect, it } from 'vitest';

import en from '../../../messages/en.json';
import uk from '../../../messages/uk.json';

/* Longer than this and the card grows a third row; the tail then leaves its corner. */
const MAX_LINE_CHARS = 70;
const DEMO_LINES = 6;

describe('speech bubble demo lines', () => {
  it.each([
    ['en', en.lab.bubble.lines],
    ['uk', uk.lab.bubble.lines],
  ])('%s: six short lines, none shouting', (_locale, lines) => {
    expect(lines).toHaveLength(DEMO_LINES);
    expect(new Set(lines).size).toBe(lines.length);
    for (const line of lines) {
      expect(line.trim(), line).toBe(line);
      expect(line.length, line).toBeGreaterThan(0);
      expect(line.length, line).toBeLessThanOrEqual(MAX_LINE_CHARS);
      expect(line, line).not.toContain('!');
    }
  });
});
