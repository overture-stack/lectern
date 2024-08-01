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
import { SchemaField } from '../metaSchema';

export const ValueChangeTypeNames = {
	CREATED: 'created',
	DELETED: 'deleted',
	UPDATED: 'updated',
	UNCHANGED: 'unchanged',
} as const;
const ValueChangeTypeName = zod.union([
	zod.literal(ValueChangeTypeNames.CREATED),
	zod.literal(ValueChangeTypeNames.DELETED),
	zod.literal(ValueChangeTypeNames.UPDATED),
	zod.literal(ValueChangeTypeNames.UNCHANGED),
]);
export type ValueChangeTypeName = zod.infer<typeof ValueChangeTypeName>;
export const ValueChange = zod.object({
	type: ValueChangeTypeName,
	data: zod.any(), // any might be right here, this is the union of all possible types of all field properties
});
export type ValueChange = zod.infer<typeof ValueChange>;

// changes can be nested
// in case of created/delete field we get Change
// in case of simple field change we get {"fieldName": {"data":.., "type": ..}}
// in case of nested fields: {"fieldName1": {"fieldName2": {"data":.., "type": ..}}}
export type FieldChanges = { [field: string]: FieldChanges } | ValueChange | undefined;
export const FieldChanges: zod.ZodType<FieldChanges> = zod.union([
	zod.lazy(() => FieldChanges),
	ValueChange,
	zod.undefined(),
]);

export const FieldDiff = zod.object({
	left: SchemaField.optional(),
	right: SchemaField.optional(),
	diff: FieldChanges,
});
export type FieldDiff = zod.infer<typeof FieldDiff>;

export const FieldDiffRecord = zod.tuple([zod.string(), FieldDiff]);
export type FieldDiffRecord = zod.infer<typeof FieldDiffRecord>;

/**
 * DictionaryDiffArray is the same constent as the DictionaryDiff but converted to an Array of tuples.
 * This is the value returned by the Lectern REST API getDiffl endpoint.
 */
export const DictionaryDiffArray = zod.array(FieldDiffRecord);
export type DictionaryDiffArray = zod.infer<typeof DictionaryDiffArray>;

/**
 * DictionaryDiff is a Map from strings of `schemaName.fieldName` to FieldDiff objects.
 * This is produced by the dictionary DiffUtils.
 */
export type DictionaryDiff = Map<string, FieldDiff>;
