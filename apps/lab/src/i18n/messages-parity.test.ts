import { describe, expect, it } from 'vitest';

import en from '../../messages/en.json';
import uk from '../../messages/uk.json';

interface MessageTree {
  [key: string]: MessageTree | string;
}

/* Flattens a message tree into dotted keys with their values. */
const flatten = (tree: MessageTree, prefix = ''): Array<[string, string]> =>
  Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix === '' ? key : `${prefix}.${key}`;

    return typeof value === 'string' ? [[path, value]] : flatten(value, path);
  });

describe('message catalogues', () => {
  const english = flatten(en);
  const ukrainian = flatten(uk);

  it('define the same keys in both languages', () => {
    expect(ukrainian.map(([key]) => key).sort()).toEqual(english.map(([key]) => key).sort());
  });

  it('leave no message empty', () => {
    for (const [key, value] of [...english, ...ukrainian]) {
      expect(value.trim().length, key).toBeGreaterThan(0);
    }
  });
});
