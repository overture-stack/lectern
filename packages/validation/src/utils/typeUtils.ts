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

/**
 * Given a predicate function that checks for type T, this will create a new predicate funcion that
 * will check if a value is of type T[].
 *
 * @example
 * type Person = { name: string; age: number };
 * const isPerson = (value: unknown): value is Person =>
 * 	!!value &&
 * 	typeof value === 'object' &&
 * 	'name' in value &&
 * 	typeof value.name === 'string' &&
 * 	'age' in value &&
 * 	typeof value.age === 'number';
 * const isPersonArray = isArrayOf(isPerson);
 * isPersonArray([{name:'Lisa', age: 8}, {name: 'Bart', age: 10}]); // true
 * isPersonArray(['not a person']); // false
 * isPersonArray([{name:'Lisa', age: 8}, {another: 'type'}]); // false
 * @param predicate
 * @returns
 */
export const isArrayOf =
	<T>(predicate: (value: unknown) => value is T) =>
	(value: unknown): value is T[] =>
		Array.isArray(value) && value.every(predicate);

/**
 * Determines if a variable is of type boolean[]
 * @param value
 * @returns
 */
export const isBooleanArray = isArrayOf((value: unknown): value is boolean => typeof value === 'boolean');

/**
 * Determines if a variable is a number, with added restriction that it is Finite.
 * This eliminates the values NaN and Infinity.
 *
 * Note: this is a wrapper on Number.isFinite(value)
 * @param value
 * @returns
 */
export const isNumber = (value: unknown): value is number => Number.isFinite(value);
/**
 * Determines if variable is of type number[], with added restriction that every element is Finite.
 * @param value
 * @returns
 */
export const isNumberArray = isArrayOf(isNumber);

/**
 * Determines if a variable is of type string[]
 * @param value
 * @returns
 */
export const isStringArray = isArrayOf((value: unknown): value is string => typeof value === 'string');

/**
 * Determines if a variable is a number, with added restriction that it is an Integer.
 *
 * Note: This is a wrapper over Number.isInteger()
 * @param value
 * @returns
 */
export const isInteger = (value: unknown): value is number => Number.isInteger(value);

/**
 * Determines if a variables is of type number[], with add restriction that every element is an Integer
 * @param value
 * @returns
 */
export const isIntegerArray = isArrayOf(isInteger);
