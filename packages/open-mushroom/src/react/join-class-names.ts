/* Joins the truthy class names with a space; `undefined` when nothing is left, so React omits the attribute. */
export const joinClassNames = (...values: Array<string | false | null | undefined>): string | undefined => {
  const joined = values.filter(Boolean).join(' ');

  return joined.length > 0 ? joined : undefined;
};
