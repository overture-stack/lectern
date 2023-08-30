/**
 * Ensure a value is wrapped in an array.
 *
 * If passed an array, return it without change. If passed a single item, wrap it in an array.
 * @param val an item or array
 * @return an array
 */
export const asArray = <T>(val: T | T[]): T[] => (Array.isArray(val) ? val : [val]);
