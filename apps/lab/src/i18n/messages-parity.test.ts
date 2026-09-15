import { describe, expect, it } from 'vitest';

import en from '../../messages/en.json';
import uk from '../../messages/uk.json';

/* A catalogue is strings nested in objects; lists of strings (the demo lines) are objects with numeric keys. */
type MessageNode = string | MessageNode[] | { [key: string]: MessageNode };

/* Flattens a message tree into dotted keys with their values. */
const flatten = (tree: MessageNode, prefix = ''): Array<[string, string]> => {
  if (typeof tree === 'string') return [[prefix, tree]];

  return Object.entries(tree).flatMap(([key, value]) => flatten(value, prefix === '' ? key : `${prefix}.${key}`));
};

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
