import { describe, expect, it } from 'vitest';

import { joinClassNames } from './join-class-names';

describe('joinClassNames', () => {
  it('joins truthy values and drops the rest', () => {
    expect(joinClassNames('om-bubble', undefined, false, null, 'custom')).toBe('om-bubble custom');
  });

  it('returns undefined when nothing is left, so React omits the attribute', () => {
    expect(joinClassNames(undefined, false)).toBeUndefined();
  });
});
