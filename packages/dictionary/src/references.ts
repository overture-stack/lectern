/*
 * Copyright (c) 2023 The Ontario Institute for Cancer Research. All rights reserved
 *
 * This program and the accompanying materials are made available under the terms of
 * the GNU Affero General Public License v3.0. You should have received a copy of the
 * GNU Affero General Public License along with this program.
 *  If not, see <http://www.gnu.org/licenses/>.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 * SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { cloneDeep, get, isObject, omit } from 'lodash';
import {
	Dictionary,
	DictionaryMeta,
	ReferenceArray,
	ReferenceTag,
	ReferenceValue,
	References,
	Schema,
	TypeUtils,
	type SchemaField,
	type StringFieldRestrictionsObject,
} from '.';
import { InvalidReferenceError } from './errors';
import { isNumberArray, isStringArray } from './utils/typeUtils';

// This is the union of all schema sections that could have reference values
type OutputReferenceValues = ReferenceArray | ReferenceValue;

type DiscoveredMap = Map<ReferenceTag, OutputReferenceValues>;
const createDiscoveredMap = () => new Map<ReferenceTag, OutputReferenceValues>();

type VisitedSet = Set<ReferenceTag>;
const createVisitedSet = () => new Set<ReferenceTag>();

const isReferenceTag = (input: unknown): input is ReferenceTag => ReferenceTag.safeParse(input).success;

/**
 * Convert a ReferenceTag value into a dot separated path that can be used by lodash _.get to find the value
 * in the references object.
 *
 * @example
 * const referenceTag = `#/some/path`;
 *
 * const path = referenceTagToObjectPath(referenceTag);
 * // some.path
 *
 * const referenceValue = _.get(references, path);
 */
const referenceTagToObjectPath = (value: ReferenceTag): string => {
	try {
		return value.split('/').slice(1).join('.');
	} catch (e) {
		throw new SyntaxError(`Unable to parse value '${value}' as a ReferenceTag.`);
	}
};

/**
 * For an array of strings, replace all values that are ReferenceTags with the corresponding reference value.
 */
const resolveArrayReferences = (
	value: string[],
	references: References,
	discovered: DiscoveredMap,
	visited: VisitedSet,
): string[] =>
	value.flatMap((item) => (isReferenceTag(item) ? resolveReference(item, references, discovered, visited) : item));

const transformOneOrMany = <TInput, TOutput>(data: TInput | TInput[], transform: (item: TInput) => TOutput) => {
	if (Array.isArray(data)) {
		return data.map(transform);
	} else {
		return transform(data);
	}
};

/**
 *
 * @param value
 * @param references
 * @param discovered
 * @param visited
 * @returns
 */
const resolveAllReferences = (
	value: string | string[],
	references: References,
	discovered: DiscoveredMap,
	visited: VisitedSet,
): string | string[] => {
	if (Array.isArray(value)) {
		return resolveArrayReferences(value, references, discovered, visited);
	}
	if (isReferenceTag(value)) {
		return resolveReference(value, references, discovered, visited);
	} else {
		return value;
	}
};

/**
 * Recursive handler for getting value associated with a reference tag.
 * This will throw an error if the tag provided finds no matching references, so ensure that the value provided
 * to the tag argument is a valid ReferenceTag.
 *
 * @param tag
 * @param references
 * @param discovered
 * @param visited
 * @returns
 */
const resolveReference = (
	tag: ReferenceTag,
	references: References,
	discovered: DiscoveredMap,
	visited: VisitedSet,
): string | string[] => {
	const cachedValue = discovered.get(tag);
	if (cachedValue !== undefined) {
		return cachedValue;
	}
	if (visited.has(tag)) {
		throw new InvalidReferenceError(`Cyclical references found for '${tag}'`);
	}
	visited.add(tag);

	const path = referenceTagToObjectPath(tag);
	const replacement = get(references, path, undefined);
	if (replacement === undefined || (isObject(replacement) && !Array.isArray(replacement))) {
		throw new InvalidReferenceError(`No reference found for provided tag '${tag}'.`);
	}
	if (Array.isArray(replacement)) {
		const output = resolveArrayReferences(replacement, references, discovered, visited);
		discovered.set(tag, output);
		return output;
	} else if (isReferenceTag(replacement)) {
		const output = resolveReference(replacement, references, discovered, visited);
		discovered.set(tag, output);
		return output;
	} else {
		// must be string now and not a reference tag
		discovered.set(tag, replacement);
		return replacement;
	}
};

/**
 * Warning:  This mutates the meta argument object. This is meant for use within this module only and should not be exported.
 */
const recursiveReplaceMetaReferences = (
	meta: DictionaryMeta,
	references: References,
	discovered: DiscoveredMap,
	visited: VisitedSet,
): DictionaryMeta => {
	for (const [key, value] of Object.entries(meta)) {
		if (isStringArray(value)) {
			// value is an array of strings, we want to check if any of the values are reference tags and replace them if they are.
			const replacement = resolveArrayReferences(value, references, discovered, visited);
			meta[key] = replacement;
		} else if (isReferenceTag(value)) {
			// value is a reference tag, we replace it with the corresponding reference.
			const replacement = resolveReference(value, references, discovered, visited);
			meta[key] = replacement;
		} else if (typeof value === 'object' && !Array.isArray(value)) {
			// value is a nested meta object, send it into this function! recursion!
			const replacement = recursiveReplaceMetaReferences(value, references, discovered, visited);
			meta[key] = replacement;
		}
	}

	return meta;
};

/**
 * Warning:  This mutates the restrictionsObject argument object. This is meant for use within this module only and should not be exported.
 */
const replaceReferencesInStringRestrictionsObject = (
	restrictionsObject: StringFieldRestrictionsObject,
	references: References,
	discovered: DiscoveredMap,
	visited: VisitedSet,
) => {
	if ('if' in restrictionsObject) {
		// Do replacements inside the if conditions
		restrictionsObject.if.conditions = restrictionsObject.if.conditions.map((condition) => {
			condition.match = condition.match.map((match) => {
				if (match.codeList && !isNumberArray(match.codeList)) {
					match.codeList = TypeUtils.asArray(resolveAllReferences(match.codeList, references, discovered, visited));
				}
				if (typeof match.value === 'string' || isStringArray(match.value)) {
					match.value = resolveAllReferences(match.value, references, discovered, visited);
				}
				if (match.regex) {
					match.regex = TypeUtils.asArray(resolveAllReferences(match.regex, references, discovered, visited));
				}
				return match;
			});
			return condition;
		});

		const transform = (data: StringFieldRestrictionsObject) =>
			replaceReferencesInStringRestrictionsObject(data, references, discovered, visited);
		if (restrictionsObject.then) {
			restrictionsObject.then = transformOneOrMany(restrictionsObject.then, transform);
		}
		if (restrictionsObject.else) {
			restrictionsObject.else = transformOneOrMany(restrictionsObject.else, transform);
		}
	} else {
		if (restrictionsObject.codeList !== undefined) {
			restrictionsObject.codeList = TypeUtils.asArray(
				resolveAllReferences(restrictionsObject.codeList, references, discovered, visited),
			);
		}
		if (restrictionsObject.regex !== undefined) {
			const updatedRegex = resolveAllReferences(restrictionsObject.regex, references, discovered, visited);
			restrictionsObject.regex = updatedRegex;
		}
	}
	return restrictionsObject;
};

/**
 * Warning:  This mutates the field argument object. This is meant for use within this module only and should not be exported.
 */
const internalReplaceFieldReferences = (
	field: SchemaField,
	references: References,
	discovered: DiscoveredMap,
	visited: VisitedSet,
): SchemaField => {
	// Process Field Meta:
	if (field.meta !== undefined) {
		field.meta = recursiveReplaceMetaReferences(field.meta, references, discovered, visited);
	}

	// Process Field Restrictions:
	if (field.restrictions !== undefined) {
		// Each field type has different allowed restriction types,
		// we need to handle the reference replacement rules carefully
		// to ensure the output schema adheres to the type rules.
		switch (field.valueType) {
			case 'string': {
				field.restrictions = transformOneOrMany(field.restrictions, (restriction) =>
					replaceReferencesInStringRestrictionsObject(restriction, references, discovered, visited),
				);
				break;
			}
			case 'number': {
				break;
			}
			case 'integer': {
				break;
			}
			case 'boolean': {
				break;
			}
		}
	}
	return field;
};

/**
 * Logic for replacing references in a schema.
 *
 * This is used by the replaceReferences method that replaces references in ALL schemas. By allowing the caller
 * to provide the discovered/visited objects that are used in the recursive logic we can let the replaceReferences
 * method reuse the same dictionaries across all schemas.
 *
 * Warning: This mutates the schema argument object. This is meant for use within this module only and should not be exported.
 * @param schema
 * @param references
 * @param discovered
 * @param visited
 * @returns
 */
const internalReplaceSchemaReferences = (
	schema: Schema,
	references: References,
	discovered: DiscoveredMap,
	visited: VisitedSet,
): Schema => {
	if (schema.meta) {
		schema.meta = recursiveReplaceMetaReferences(schema.meta, references, discovered, visited);
	}

	schema.fields.forEach((field) => {
		internalReplaceFieldReferences(field, references, discovered, visited);
	});

	return schema;
};

/**
 * Replace all ReferenceTags in in the restrictions and meta sections of the field definition object with
 * values retrieved from the `references` object.
 */
export const replaceMetaReferences = (meta: DictionaryMeta, references: References): DictionaryMeta => {
	const clone = cloneDeep(meta);
	return recursiveReplaceMetaReferences(clone, references, createDiscoveredMap(), createVisitedSet());
};

/**
 * Replace all ReferenceTags in in the restrictions and meta sections of the field definition object with
 * values retrieved from the `references` object.
 */
export const replaceFieldReferences = (field: SchemaField, references: References): SchemaField => {
	const clone = cloneDeep(field);
	return internalReplaceFieldReferences(clone, references, createDiscoveredMap(), createVisitedSet());
};

/**
 * Replace all Reference Tags in the restrictions and meta sections of the schema with values retrieved from
 * the `references` argument.
 * @param schema
 * @param references
 * @return schema clone with references replaced
 */
export const replaceSchemaReferences = (schema: Schema, references: References) => {
	const clone = cloneDeep(schema);
	return internalReplaceSchemaReferences(clone, references, createDiscoveredMap(), createVisitedSet());
};

/**
 * Replace all ReferenceTags found in dictionary schemas with the values retrieved from the dictionary's references.
 * @param dictionary
 * @returns Clone of dictionary with reference replacements
 */
export const replaceReferences = (dictionary: Dictionary): Dictionary => {
	const clone = cloneDeep(omit(dictionary, 'references'));
	const references = dictionary.references || {};
	const discovered = createDiscoveredMap();
	const visited = createVisitedSet();

	clone.schemas = dictionary.schemas.map((schema) =>
		internalReplaceSchemaReferences(schema, references, discovered, visited),
	);

	return clone;
};
