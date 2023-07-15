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

import { References, Schema } from 'dictionary';
import * as immer from 'immer';
import { ZodError } from 'zod';
import { replaceSchemaReferences } from 'dictionary';

export function validate(schema: Schema, references: References): { valid: boolean; errors?: ZodError } {
	const schemaWithReplacements = replaceSchemaReferences(schema, references);

	// Ensure schema is still valid after reference replacement
	// TODO: errors originating here should contain better messaging about failure after reference replacement
	const parseResult = Schema.safeParse(schemaWithReplacements);

	return parseResult.success ? { valid: true } : { valid: false, errors: parseResult.error };
}

/**
 * String formatting of values provided as scripts. This will normalize the formatting of newline characters,
 * All instances of `/r/n` will be converted to `/n`
 * @param script
 * @returns
 */
function normalizeScript(input: string | string[]) {
	const normalize = (script: string) => script.replace(/\r\n/g, '\n');

	if (typeof input === 'string') {
		return normalize(input);
	} else {
		return input.map(normalize);
	}
}

export function normalizeSchema(schema: Schema): Schema {
	const normalizedFields = schema.fields.map((baseField) =>
		immer.produce(baseField, (field) => {
			if (
				field.valueType !== 'boolean' &&
				field.restrictions !== undefined &&
				field.restrictions.script !== undefined
			) {
				field.restrictions.script = normalizeScript(field.restrictions.script);
			}
		}),
	);

	return immer.produce(schema, (draft) => {
		draft.fields = normalizedFields;
	});
}
