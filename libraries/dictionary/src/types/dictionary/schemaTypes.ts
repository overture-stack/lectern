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
import { SchemaField } from './schemaFieldTypes';
import allUnique from 'utils/allUnique';

export const ForeignKeyRestrictionMapping = zod.object({
	schema: NameString,
	mappings: zod.array(
		zod.object({
			local: NameString,
			foreign: NameString,
		}),
	),
});

export const Schema = zod
	.object({
		name: NameString,
		description: zod.string().optional(),
		fields: zod.array(SchemaField).min(1),
		meta: DictionaryMeta.optional(),
		restrictions: zod
			.object({
				foreignKey: zod.array(ForeignKeyRestrictionMapping).min(1),
				uniqueKey: zod.array(NameString).min(1),
			})
			.partial()
			.optional(),
	})
	.strict()
	.refine(
		(schema) => allUnique(schema.fields.map((field) => field.name)),
		'All fields in the schema must have a unique name.',
	)
	.refine((schema) => {
		if (schema.restrictions && schema.restrictions.uniqueKey) {
			return schema.restrictions.uniqueKey
				.map((requiredField) => schema.fields.some((field) => field.name === requiredField))
				.every((requiredField) => requiredField);
		} else {
			return true;
		}
	}, "A field listed in schema restrictions.uniqueKey is not included the schema's fields")
	.superRefine((schema, ctx) => {
		const fieldNames = schema.fields.map((field) => field.name);
		if (schema.restrictions?.foreignKey) {
			schema.restrictions.foreignKey.forEach((fkRestriction) => {
				if (fkRestriction.schema === schema.name) {
					ctx.addIssue({
						code: zod.ZodIssueCode.custom,
						message: `Schema '${schema.name}' has a foreignKey restriction that references itself. ForeignKey restrictions must reference another schema.`,
					});
				} else {
					fkRestriction.mappings.forEach((fkMapping) => {
						if (!fieldNames.includes(fkMapping.local)) {
							ctx.addIssue({
								code: zod.ZodIssueCode.custom,
								message: `Schema '${schema.name}' has a foreign key restriction with local field '${fkMapping.local}' that does not exist in the schema's fields.`,
							});
						}
					});
				}
			});
		}
	});
export type Schema = zod.infer<typeof Schema>;
