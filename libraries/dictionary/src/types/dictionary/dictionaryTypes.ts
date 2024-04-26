/*
 * Copyright (c) 2024 The Ontario Institute for Cancer Research. All rights reserved
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

import { z as zod } from 'zod';
import { NameString } from './commonDictionaryTypes';
import { DictionaryMeta } from './metaTypes';
import { References } from './referenceTypes';
import { Schema } from './schemaTypes';
import allUnique from 'utils/allUnique';

export const VersionString = zod.string().regex(RegExp('^[0-9]+.[0-9]+$'));
// TODO: Semantic Versioning version string, reference: https://gist.github.com/jhorsman/62eeea161a13b80e39f5249281e17c39
// update requires dictionary service changes, leaving like this for now
// .regex(RegExp('^([0-9]+).([0-9]+).([0-9]+)(?:-([0-9A-Za-z-]+(?:.[0-9A-Za-z-]+)*))?(?:+[0-9A-Za-z-]+)?$'));

// Dictionary Base is the dictionary object types only, no refinements enforcing the restriction rules.
// This is needed to use for the base of the dbType DictionaryDocument
export const DictionaryBase = zod
	.object({
		name: NameString,
		description: zod.string().optional(),
		meta: DictionaryMeta.optional(),
		references: References.optional(),
		schemas: zod.array(Schema).min(1),
		version: VersionString,
	})
	.strict();
export const Dictionary = DictionaryBase.refine(
	(dictionary) => allUnique(dictionary.schemas.map((schema) => schema.name)),
	// TODO: Can improve uniqueness check error by providing list of duplicate field names.
	'All schemas in the dictionary must have a unique name.',
).superRefine((dictionary, ctx) => {
	/**
	 * Enforce schema foreignKey restrictions:
	 * 1. make sure that the foreign schema referenced in all provided foreignKey restrictions have matching schemas in the dictionary
	 * 2. make sure all foreign fields listed in foreignKey restrictions have matching fields in the specified foreign schemas
	 */

	// List of all schemas and all their fields, for cross reference from the foreignKey checks
	const schemaNames = dictionary.schemas.map((schema) => schema.name);
	const schemaFieldMap: Record<string, string[]> = dictionary.schemas.reduce<Record<string, string[]>>(
		(acc, schema) => {
			const fieldNames = schema.fields.map((field) => field.name);
			return { ...acc, [schema.name]: fieldNames };
		},
		{},
	);

	// Loop through each schema and apply checks if they have a foreignKey restriction
	dictionary.schemas.forEach((schema) => {
		if (schema.restrictions?.foreignKey) {
			// We have a foreign key restriction, now we will now check its properties all reference existing schemas and fields

			schema.restrictions.foreignKey.forEach((fkRestriction) => {
				if (schemaNames.includes(fkRestriction.schema)) {
					fkRestriction.mappings.forEach((fkMapping) => {
						if (!schemaFieldMap[fkRestriction.schema]?.includes(fkMapping.foreign)) {
							// foreign field does not exist on foreign schema
							ctx.addIssue({
								code: zod.ZodIssueCode.custom,
								message: `Schema ForeignKey restriction references a foreign field that does not exist on the foreign schema. The schema '${schema.name}' references the foreign schema named '${fkRestriction.schema}' with foreign field '${fkMapping.foreign}'.`,
							});
						}

						// ensure mapped fields are the same type
						const localFieldType = schema.fields.find((field) => field.name === fkMapping.local)?.valueType;
						const foreignFieldType = dictionary.schemas
							.find((s) => s.name === fkRestriction.schema)
							?.fields.find((field) => field.name === fkMapping.foreign)?.valueType;
						if (localFieldType && foreignFieldType && localFieldType !== foreignFieldType) {
							//dont match undefined === undefined. Missing field validations are output elsewhere so don't check that here.
							ctx.addIssue({
								code: zod.ZodIssueCode.custom,
								message: `Schema ForeignKey restriction maps two fields of different types: the restriction in schema '${schema}' maps local field '${fkMapping.local}' of type '${localFieldType}' to foreign schema '${fkRestriction.schema}' and field '${fkMapping.foreign}' of type '${foreignFieldType}'.`,
							});
						}
					});
				} else {
					// foreign schema name is not included in this dictionary, add error to context
					ctx.addIssue({
						code: zod.ZodIssueCode.custom,
						message: `Schema ForeignKey restriction references a schema name that is not included in the dictionary. The schema '${schema.name}' references foreign schema name '${fkRestriction.schema}'.`,
					});
				}
			});
		}
	});
});
export type Dictionary = zod.infer<typeof Dictionary>;
