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

import { DataRecord, SchemaField } from 'dictionary';
import vm from 'vm';
import {
	BaseSchemaValidationError,
	SchemaValidationErrorTypes,
	ScriptValidationError,
} from '../types/validationErrorTypes';
import { ValidationFunction } from '../types/validationFunctionTypes';
import { isDefined } from '../utils/typeUtils';
import { asArray } from 'common';

const ctx = vm.createContext();

/**
 * Check all values of a DataRecord pass all script restrictions in their schema.
 * This will run all script restrictions from the provided inside a Node VM context.
 *
 * Running code in teh VM context will protect the global Node data context from interactions
 * with the schema script, either being read or written.
 *
 * @param record
 * @param index
 * @param fields
 * @returns
 */
export const validateScript: ValidationFunction = (record, index, fields) => {
	return fields
		.map((field) => {
			if (field.restrictions && field.restrictions.script) {
				const scriptResult = validateWithScript(field, record);
				if (!scriptResult.valid) {
					return buildScriptError(
						{ fieldName: field.name, index },
						{
							message: scriptResult.message,
							value: record[field.name],
						},
					);
				}
			}
			return undefined;
		})
		.filter(isDefined);
};

const buildScriptError = (
	errorData: BaseSchemaValidationError,
	info: ScriptValidationError['info'],
): ScriptValidationError => {
	const message = info.message || `${errorData.fieldName} was invalid based on a script restriction.`;

	return {
		...errorData,
		errorType: SchemaValidationErrorTypes.INVALID_BY_SCRIPT,
		info,
		message,
	};
};

const getScript = (scriptString: string) => {
	const script = new vm.Script(scriptString);
	return script;
};

const validateWithScript = (
	field: SchemaField,
	record: DataRecord,
): {
	valid: boolean;
	message: string;
} => {
	try {
		const args = {
			$row: record,
			$field: record[field.name],
			$name: field.name,
		};

		if (!field.restrictions || !field.restrictions.script) {
			throw new Error('called validation by script without script provided');
		}

		// scripts should already be strings inside arrays, but ensure that they are to help transition between lectern versions
		// checking for this can be removed in future versions of lectern (feb 2020)
		const scripts = asArray(field.restrictions.script);

		let result: {
			valid: boolean;
			message: string;
		} = {
			valid: false,
			message: '',
		};

		for (const scriptString of scripts) {
			const script = getScript(scriptString);
			const valFunc = script.runInContext(ctx);
			if (!valFunc) throw new Error('Invalid script');
			result = valFunc(args);
			/* Return the first script that's invalid. Otherwise result will be valid with message: 'ok'*/
			if (!result.valid) break;
		}

		return result;
	} catch (err) {
		console.error(
			`failed running validation script ${field.name} for record: ${JSON.stringify(record)}. Error message: ${err}`,
		);
		return {
			valid: false,
			message: 'failed to run script validation, check script and the input',
		};
	}
};
