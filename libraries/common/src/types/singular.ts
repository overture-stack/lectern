/**
 * Utility type that finds the type or types from inside an Array or nested Arrays.
 *
 * @example
 * type String = Singular<string>; // `String` is `string`
 * type JustAString = Singular<string[]>; // `JustAString` is `string`
 * type StillJustAString = Singular<(string[][][][][]>; // `StillJustAString` is `string`
 * type StringOrNumberFromUnion = Singular<(string[] | number)[] | string>; // `StringOrNumber` is `string | number`
 * type TupleContents = Singular<[number, string, boolean]> // `TupleContents` is `number | string | boolean`
 * type ArrayOfTuplesContents = Singular<[number, string, boolean]> // `ArrayOfTuplesContents` is `number | string | boolean`
 */
export type Singular<T> = T extends Array<infer ElementTypes>
	? Singular<ElementTypes>
	: T extends ReadonlyArray<infer ElementTypes>
	? Singular<ElementTypes>
	: T;
