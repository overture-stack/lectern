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

import { isArray } from 'lodash';
import { RangeRestriction } from './schema-entities';

function getForeignKeyErrorMsg(errorData: any) {
	const valueEntries = Object.entries(errorData.info.value);
	const formattedKeyValues: string[] = valueEntries.map(([key, value]) => {
		if (isArray(value)) {
			return `${key}: [${value.join(', ')}]`;
		} else {
			return `${key}: ${value}`;
		}
	});
	const valuesAsString = formattedKeyValues.join(', ');
	const detail = `Key ${valuesAsString} is not present in schema ${errorData.info.foreignSchema}`;
	const msg = `Record violates foreign key restriction defined for field(s) ${errorData.fieldName}. ${detail}.`;
	return msg;
}

function getUniqueKeyErrorMsg(errorData: any) {
	const uniqueKeyFields: string[] = errorData.info.uniqueKeyFields;
	const formattedKeyValues: string[] = uniqueKeyFields.map((fieldName) => {
		const value = errorData.info.value[fieldName];
		if (isArray(value)) {
			return `${fieldName}: [${value.join(', ')}]`;
		} else {
			return `${fieldName}: ${value === '' ? 'null' : value}`;
		}
	});
	const valuesAsString = formattedKeyValues.join(', ');
	const msg = `Key ${valuesAsString} must be unique.`;
	return msg;
}

const INVALID_VALUE_ERROR_MESSAGE = 'The value is not permissible for this field.';
const ERROR_MESSAGES: { [key: string]: (errorData: any) => string } = {
	INVALID_FIELD_VALUE_TYPE: () => INVALID_VALUE_ERROR_MESSAGE,
	INVALID_BY_REGEX: (errData) => getRegexErrorMsg(errData.info),
	INVALID_BY_RANGE: (errorData) => `Value is out of permissible range, value must be ${rangeToSymbol(errorData.info)}.`,
	INVALID_BY_SCRIPT: (error) => error.info.message,
	INVALID_ENUM_VALUE: () => INVALID_VALUE_ERROR_MESSAGE,
	MISSING_REQUIRED_FIELD: (errorData) => `${errorData.fieldName} is a required field.`,
	INVALID_BY_UNIQUE: (errorData) => `Value for ${errorData.fieldName} must be unique.`,
	INVALID_BY_FOREIGN_KEY: (errorData) => getForeignKeyErrorMsg(errorData),
	INVALID_BY_UNIQUE_KEY: (errorData) => getUniqueKeyErrorMsg(errorData),
};

// Returns the formatted message for the given error key, taking any required properties from the info object
// Default value is the errorType itself (so we can identify errorTypes that we are missing messages for and the user could look up the error meaning in our docs)
const schemaErrorMessage = (errorType: string, errorData: any = {}): string => {
	return errorType && Object.keys(ERROR_MESSAGES).includes(errorType)
		? ERROR_MESSAGES[errorType](errorData)
		: errorType;
};

const rangeToSymbol = (range: RangeRestriction): string => {
	let minString = '';
	let maxString = '';

	const hasBothRange =
		(range.min !== undefined || range.exclusiveMin !== undefined) &&
		(range.max != undefined || range.exclusiveMax !== undefined);

	if (range.min !== undefined) {
		minString = `>= ${range.min}`;
	}

	if (range.exclusiveMin !== undefined) {
		minString = `> ${range.exclusiveMin}`;
	}

	if (range.max !== undefined) {
		maxString = `<= ${range.max}`;
	}

	if (range.exclusiveMax !== undefined) {
		maxString = `< ${range.exclusiveMax}`;
	}

	return hasBothRange ? `${minString} and ${maxString}` : `${minString}${maxString}`;
};

function getRegexErrorMsg(info: any) {
	let msg = `The value is not a permissible for this field, it must meet the regular expression: "${info.regex}".`;
	if (info.examples) {
		msg = msg + ` Examples: ${info.examples}`;
	}
	return msg;
}

export default schemaErrorMessage;
