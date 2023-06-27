/*
 * Copyright (c) 2020 The Ontario Institute for Cancer Research. All rights reserved
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

import { DictionaryDocument } from '../models/Dictionary';
import { InvalidReferenceError } from '../utils/errors';
import { get, omit, cloneDeep } from 'lodash';

/**
 *
 * @param dictionary Dictionary object, matching the mongoose documents
 * @returns Dictionary with replacements made
 */
export const replaceReferences = (dictionary: DictionaryDocument) => {
	const { schemas, references } = dictionary;

	const updatedSchemas = schemas.map((schema) => replaceSchemaReferences(schema, references));
	const clone = cloneDeep(dictionary);
	clone.schemas = updatedSchemas;
	// Remove references property
	return omit(clone, 'references');
};

/**
 * @param schema
 * @param references
 * @return schema clone with references replaced
 */
export const replaceSchemaReferences = (schema: any, references: any) => {
	const clone = cloneDeep(schema);

	const referenceSections = ['restrictions', 'meta'];

	clone.fields.forEach((field: any) => {
		referenceSections.forEach((section) => {
			for (const key in field[section]) {
				const value = field[section][key];
				const discovered = new Map<string, any>();
				const visited = new Set<string>();
				let replacedValue: any;
				try {
					replacedValue = replaceAllReferences(value, references, discovered, visited);
				} catch (e) {
					if (e instanceof InvalidReferenceError) {
						const errorMessage = e.message + `. Schema: ${clone.name} Field: ${field.name} - Path: ${section}.${key}`
						throw new InvalidReferenceError(errorMessage);
					} else {
						throw e; // re-throw the error unchanged
					}
				}
				field[section][key] = replacedValue;
			}
		});
	});
	return clone;
};

// Check if an object or any of its elements is a reference and try to resolve it, taking into account they can be embedded. 
// In `discovered` references that have been resolved are kept to avoid reprocessing, and `visited` helps to avoid cycles.
const replaceAllReferences = (obj: any, references: any, discovered: Map<string, any>, visited: Set<string>): any => {
	if (isTerminalSymbol(obj)) {
		// The object could be a terminal symbol already, like a boolean, or a number. In that case, further search is not required.
		return obj;
	}
	if (isReferenceValue(obj)) {
		// If the object represents a reference, then try to resolve it, either by a direct look up or recursively.
		return resolveReference(obj, references, discovered, visited);
	} else if (Array.isArray(obj)) {
		// If the object is an array, each element could potentially be a reference that ends up being resolved to one or more elements.
		return replaceReferencesInArray(obj, references, discovered, visited);
	} else {
		// `obj` is an object, so each property is replaced with the resolved references
		return replaceReferencesInObject(obj, references, discovered, visited);
	}
}

const referenceToObjectPath = (value: string) => {
	return value
		.split('/')
		.slice(1)
		.join('.');
};

const isReferenceValue = (value: string) => {
	const regex = new RegExp('^#(/[-_A-Za-z0-9]+)+$');
	return regex.test(value);
};

// Checks if the symbol is already something that can be replaced in a reference
const isTerminalSymbol = (value: any): boolean => {
	return typeof value !== 'object' && !(isReferenceValue(value))
}

const resolveReference = (reference: string, references: any, discovered: Map<string, any>, visited: Set<string>): any => {
	if (discovered.has(reference)) {
		return discovered.get(reference)
	}
	const refPath = referenceToObjectPath(reference);
	const replacement = get(references, refPath, undefined);
	if (!replacement) {
		throw new InvalidReferenceError(`Unknown reference found - Reference: ${refPath}`);
	}
	if (isTerminalSymbol(replacement)) {
		discovered.set(reference, replacement);
		return replacement;
	} else {
		if (visited.has(reference)) {
			throw new InvalidReferenceError(`Cyclical references found - Reference: ${refPath}`);
		}
		visited.add(reference);
		const resolvedReplacement = replaceAllReferences(replacement, references, discovered, visited);
		discovered.set(reference, resolvedReplacement);
		return resolvedReplacement;
	}
}

const replaceReferencesInArray = (arr: any[], references: any, discovered: Map<string, any>, visited: Set<string>): any[] => {
	const replacedArray: any[] = [];
	arr.forEach(element => {
		const replacedValue = replaceAllReferences(element, references, discovered, visited);
		if (Array.isArray(replacedValue)) {
			replacedArray.push(...replacedValue)
		} else {
			replacedArray.push(replacedValue)
		}
	});
	return replacedArray;
}

const replaceReferencesInObject = (obj: any, references: any, discovered: Map<string, any>, visited: Set<string>): any[] => {
	Object.entries(obj).forEach(([key, value]) => {
		const replacedValue = replaceAllReferences(value, references, discovered, visited);
		obj[key] = replacedValue;
	});
	return obj;
}

