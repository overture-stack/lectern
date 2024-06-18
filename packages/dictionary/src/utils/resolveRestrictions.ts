// import {
// 	BooleanFieldRestrictions,
// 	IntegerFieldRestrictions,
// 	NumberFieldRestrictions,
// 	SchemaBooleanField,
// 	SchemaField,
// 	SchemaIntegerField,
// 	SchemaNumberField,
// 	SchemaStringField,
// 	StringFieldRestrictions,
// } from 'types';

// type SingleElement<T> = T extends readonly (infer Element)[] ? Element : T;

// /**
//  * Given a schema field, get the type of the restriction object
//  */
// export type RestrictionObject<T extends SchemaField> = T extends { restrictions?: infer RestrictionType }
// 	? SingleElement<RestrictionType>
// 	: never;

// type BR = RestrictionObject<SchemaIntegerField | SchemaBooleanField>;
// const x: BR = {};

// export const resolveRestrictions = <T extends SchemaIntegerField | SchemaBooleanField>(
// 	field: T,
// ): RestrictionObject<T> => {
// 	const y: RestrictionObject<T> = { required: true };

// 	if (!field.restrictions) {
// 		return {};
// 	}
// 	if (field.valueType === 'integer') {
// 		const restrictions = field.restrictions;
// 		return {};
// 	}
// 	return {};
// 	// if(!field.restrictions) {
// 	// 	return {};
// 	// }
// 	// if(!Array.isArray(field.))
// };

// type A = { type: 'a'; thing: number };
// type B = { type: 'b'; thing: string };
// type DUnion = A | B;

// type ThingType<T extends DUnion> = T extends { thing: infer U } ? U : never;

// type AThing = ThingType<A>;
// type BThing = ThingType<B>;
