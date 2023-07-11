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

import * as immer from 'immer';
import { cloneDeep, get, isObject, omit } from 'lodash';
import { Dictionary, ReferenceArray, ReferenceTag, ReferenceValue, References, Schema } from '.';
import { InvalidReferenceError, asArray } from 'common';

// This is the union of all schema sections that could have reference values
type OutputReferenceValues = ReferenceArray | ReferenceValue;

type DiscoveredMap = Map<ReferenceTag, OutputReferenceValues>;
type VisitedSet = Set<ReferenceTag>;

/**
 * Logic for replacing references in an individual schema.
 *
 * This is used by the replaceReferences method that replaces references in ALL schemas. By allowing the caller
 * to provide the discovered/visited objects that are used in the recursive logic we can let the replaceReferences
 * method reuse the same dictionaries across all schemas.
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
	const clone = cloneDeep(schema);

	clone.fields.forEach((field) => {
		// Process Field Meta:
		if (field.meta !== undefined) {
			for (const key in field.meta) {
				const value = field.meta[key];
				if (isReferenceTag(value)) {
					const replacement = resolveReference(value, references, discovered, visited);
					if (Array.isArray(replacement)) {
						throw new InvalidReferenceError(
							`Field '${field.name}' has meta field '${key}' with a reference '${value}' that resolves to an array. Meta fields must be string, number, or boolean.`,
						);
					}
				}
			}
		}
		// Process Field Restrictions:
		if (field.restrictions !== undefined) {
			// reusable functions to simplify converting
			const resolveRestriction = (value: string | string[]) =>
				resolveAllReferences(value, references, discovered, visited);
			const resolveNoArrays = (value: string | string[], restrictionName: string) => {
				const output = resolveRestriction(value);
				if (Array.isArray(output)) {
					throw new InvalidReferenceError(
						`Field '${field.name}' has restriction '${restrictionName}' with a reference '${value}' that resolves to an array. This restriction must be a string.`,
					);
				}
				return output;
			};
			switch (field.valueType) {
				// Each field type has different allowed restriction types, we need to handle the reference replacement rules carefully
				// to ensure the output schema adhers to the type rules.
				// All the checking for undefined prevents us from adding properties with value undefined into the field's ouput JSON
				case 'string':
					if (field.restrictions.codeList !== undefined) {
						field.restrictions.codeList = asArray(resolveRestriction(field.restrictions.codeList));
					}
					if (field.restrictions.regex !== undefined) {
						field.restrictions.regex = resolveNoArrays(field.restrictions.regex, 'regex');
					}
					if (field.restrictions.script !== undefined) {
						field.restrictions.script = asArray(resolveRestriction(field.restrictions.script));
					}
					break;
				case 'number':
					if (field.restrictions.script !== undefined) {
						field.restrictions.script = asArray(resolveRestriction(field.restrictions.script));
					}
					break;
				case 'integer':
					if (field.restrictions.script !== undefined) {
						field.restrictions.script = asArray(resolveRestriction(field.restrictions.script));
					}
					break;
				case 'boolean':
					break;
			}
		}
	});

	return clone;
};

const isReferenceTag = (input: unknown): input is ReferenceTag => ReferenceTag.safeParse(input).success;
const referenceTagToObjectPath = (value: ReferenceTag): string => {
	try {
		return value.split('/').slice(1).join('.');
	} catch (e) {
		throw new SyntaxError(`Unable to parse value '${value}' as a ReferenceTag.`);
	}
};

const resolveAllReferences = (
	value: string | string[],
	references: References,
	discovered: DiscoveredMap,
	visited: VisitedSet,
): string | string[] => {
	if (Array.isArray(value)) {
		return value.flatMap((item) =>
			isReferenceTag(item) ? resolveReference(item, references, discovered, visited) : item,
		);
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
	console.log('resolveReference for tag', tag);
	const cachedValue = discovered.get(tag);
	if (cachedValue !== undefined) {
		console.log('returning cached');
		return cachedValue;
	}
	if (visited.has(tag)) {
		throw new InvalidReferenceError(`Cyclical references found for '${tag}'`);
	}
	visited.add(tag);

	const path = referenceTagToObjectPath(tag);
	const replacement = get(references, path, undefined);
	console.log({ path, replacement });
	if (replacement === undefined || (isObject(replacement) && !Array.isArray(replacement))) {
		throw new InvalidReferenceError(`No reference found for provided tag '${tag}'.`);
	}
	if (Array.isArray(replacement)) {
		const output = replacement.flatMap((item) =>
			isReferenceTag(item) ? resolveReference(item, references, discovered, visited) : item,
		);
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
 * Replace all Reference Tags in the restrictions and meta sections of the schema with values retrieved from
 * the `references` argument.
 * @param schema
 * @param references
 * @return schema clone with references replaced
 */
export const replaceSchemaReferences = (schema: Schema, references: References) =>
	internalReplaceSchemaReferences(
		schema,
		references,
		new Map<ReferenceTag, OutputReferenceValues>(),
		new Set<ReferenceTag>(),
	);

/**
 * Replace all ReferenceTags found in dictionary schemas with the values retrieved from the dictionary's references.
 * @param dictionary
 * @returns Clone of dictionary with reference replacements
 */
export const replaceReferences = (dictionary: Dictionary): Dictionary => {
	const references = dictionary.references || {};
	const discovered: DiscoveredMap = new Map<ReferenceTag, OutputReferenceValues>();
	const visited: VisitedSet = new Set<ReferenceTag>();

	const updatedDictionary = immer.produce(dictionary, (draft) => {
		draft.schemas = draft.schemas.map((schema) =>
			internalReplaceSchemaReferences(schema, references, discovered, visited),
		);
	});

	return omit(updatedDictionary, 'references');
};
