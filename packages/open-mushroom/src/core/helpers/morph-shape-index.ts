/*
 * The build rewrites every slot outline to start at the same anatomical point
 * and run clockwise, so the right MorphSVG mapping is always the identity.
 * Pinning shapeIndex to 0 for every subpath keeps the plugin from searching
 * for a "closer" start that swaps the two sides of a stroke ribbon.
 */
export const subpathCount = (pathData: string | null | undefined): number => (pathData?.match(/[Mm]/g) ?? []).length;

/*
 * Sized to the larger subpath count; mid-morph MorphSVG may leave fabricated
 * point-subpaths in the live `d`, so the array can be longer than the target
 * needs — the plugin reads only as many entries as it has subpaths.
 */
export const pinnedShapeIndex = (fromPathData: string | null | undefined, toPathData: string): number[] =>
  Array.from({ length: Math.max(subpathCount(fromPathData), subpathCount(toPathData), 1) }, () => 0);
