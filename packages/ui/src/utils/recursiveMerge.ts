import type { RecursivePartial } from './RecursivePartial';

/**
 * Overwrite values of the destination object with the values in the source object.
 *
 * It is important that the generic type used does not include properties that allow a union of different shapes.
 * For example, if a property is `y: {a: number}|{b: string}` then the merge will result in
 *
 * @param source
 * @param destination
 * @returns
 */
function recursiveMerge<T extends object>(destination: T, ...sources: Array<RecursivePartial<T>>): T {
	const output: T = { ...destination };
	sources.forEach((source) => {
		for (const key in source) {
			if (source[key] !== undefined) {
				const sourceValue = source[key];
				const outputValue = output[key];
				if (
					typeof sourceValue === 'object' &&
					sourceValue !== null &&
					!Array.isArray(sourceValue) &&
					typeof outputValue === 'object' &&
					outputValue !== null &&
					!Array.isArray(outputValue)
				) {
					// both sourceValue and destinationValue are objects
					output[key] = recursiveMerge<any>(outputValue, sourceValue);
				} else {
					output[key] = sourceValue as any;
				}
			}
		}
	});
	return output;
}

export default recursiveMerge;
