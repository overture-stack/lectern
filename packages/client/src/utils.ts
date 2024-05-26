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

import fs from 'fs';
import deepFreeze from 'deep-freeze';
import _ from 'lodash';
import { isArray } from 'util';

const fsPromises = fs.promises;

export namespace Checks {
	export const checkNotNull = (argName: string, arg: any) => {
		if (!arg) {
			throw new Errors.InvalidArgument(argName);
		}
	};
}

export namespace Errors {
	export class InvalidArgument extends Error {
		constructor(argumentName: string) {
			super(`Invalid argument : ${argumentName}`);
		}
	}

	export class NotFound extends Error {
		constructor(msg: string) {
			super(msg);
		}
	}

	export class StateConflict extends Error {
		constructor(msg: string) {
			super(msg);
		}
	}
}

// type gaurd to filter out undefined and null
// https://stackoverflow.com/questions/43118692/typescript-filter-out-nulls-from-an-array
export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
	// lodash 4.14 behavior note, these are all evaluated to true:
	// _.isEmpty(null) _.isEmpty(undefined) _.isEmpty([])
	// _.isEmpty({}) _.isEmpty('') _.isEmpty(12) & _.isEmpty(NaN)

	// so check number seperately since it will evaluate to isEmpty=true
	return (isNumber(value) && !isNaN(value)) || !_.isEmpty(value);
}

export function isEmpty<TValue>(value: TValue | null | undefined): value is undefined {
	return !notEmpty(value);
}

export const convertToArray = <T>(val: T | T[]): T[] => {
	if (Array.isArray(val)) {
		return val;
	} else {
		return [val];
	}
};

export function isString(value: any): value is string {
	return typeof value === 'string' || value instanceof String;
}

export function isStringArray(value: any | undefined | null): value is string[] {
	return Array.isArray(value) && value.every(isString);
}

export function isNumber(value: any): value is number {
	return typeof value === 'number';
}

export function isNumberArray(values: any): values is number[] {
	return Array.isArray(values) && values.every(isNumber);
}

// returns true if value matches at least one of the expressions
export const isStringMatchRegex = (expressions: RegExp[], value: string) => {
	return expressions.filter((exp) => RegExp(exp).test(value)).length >= 1;
};

export const isNotEmptyString = (value: string | undefined): value is string => {
	return isNotAbsent(value) && value.trim() !== '';
};

export const isEmptyString = (value: string) => {
	return !isNotEmptyString(value);
};

export const isAbsent = (value: string | number | boolean | undefined): value is undefined => {
	return !isNotAbsent(value);
};

export const isNotAbsent = (value: string | number | boolean | undefined): value is string | number | boolean => {
	return value !== null && value !== undefined;
};

export const sleep = async (milliSeconds: number = 2000) => {
	return new Promise((resolve) => setTimeout(resolve, milliSeconds));
};

export function toString(obj: any) {
	if (!obj) {
		return undefined;
	}
	Object.keys(obj).forEach((k) => {
		if (typeof obj[k] === 'object') {
			return toString(obj[k]);
		}
		obj[k] = `${obj[k]}`;
	});

	return obj;
}

export function isValueEqual(value: any, other: any) {
	if (isArray(value) && isArray(other)) {
		return _.difference(value, other).length === 0; // check equal, ignore order
	}

	return _.isEqual(value, other);
}

export function isValueNotEqual(value: any, other: any) {
	return !isValueEqual(value, other);
}

export function convertToTrimmedString(val: unknown | undefined | string | number | boolean | null) {
	return val === undefined || val === null ? '' : String(val).trim();
}

export const F = deepFreeze;
