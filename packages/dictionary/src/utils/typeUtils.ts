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

/**
 * Ensure a value is wrapped in an array.
 *
 * If passed an array, return it without change. If passed a single item, wrap it in an array.
 * @param val an item or array
 * @return an array
 */
export const asArray = <T>(val: T | T[]): T[] => (Array.isArray(val) ? val : [val]);

/**
 * Given a predicate function that checks for type `T`, this will create a new predicate funcion that
 * will check if a value is of type `T[]`.
 *
 * @example
 * // Create type and predicate for `Person`:
 * type Person = { name: string; age: number };
 * const isPerson = (value: unknown): value is Person =>
 * 	!!value &&
 * 	typeof value === 'object' &&
 * 	'name' in value &&
 * 	typeof value.name === 'string' &&
 * 	'age' in value &&
 * 	typeof value.age === 'number';
 *
 * // Use `isArrayOf` and the new predicate to create `isPersonArray`:
 * const isPersonArray = isArrayOf(isPerson);
 *
 * // Usage of `isPersonArray`:
 * isPersonArray([{name:'Lisa', age: 8}, {name: 'Bart', age: 10}]); // true
 * isPersonArray(['not a person']); // false
 * isPersonArray('not an array'); // false
 * isPersonArray([{name:'Lisa', age: 8}, {not: 'a person'}]); // false
 * @param predicate
 * @returns
 */
export const isArrayOf =
	<T>(predicate: (value: unknown) => value is T) =>
	(value: unknown) =>
		Array.isArray(value) && value.every(predicate);

/**
 * Determines if a variable is of type `boolean[]`.
 * @param value
 * @returns
 */
export const isBooleanArray = isArrayOf((value: unknown) => typeof value === 'boolean');

/**
 * Checks that the input does not equal undefined (and lets the type checker know).
 *
 * Useful for filtering undefined values out of lists.
 *
 * (input) => input !== undefined
 *
 * @example
 * const combinedArray: Array<string | undefined> = ['hello', undefined, 'world'];
 * const stringArray = combinedArray.filter(isDefined); // type is: Array<string>
 */
export const isDefined = <T>(input: T | undefined) => input !== undefined;

/**
 * Determines if a variable is a number, with added restriction that it is Finite.
 * This eliminates the values `NaN` and `Infinity`.
 *
 * Note: this is just a wrapper on `Number.isFinite` which is used by Lectern for identifying numbers in data value type checks.
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
export const isStringArray = isArrayOf((value: unknown) => typeof value === 'string');

/**
 * Determines if a variable is a number, with added restriction that it is an Integer.
 *
 * Note: This is a wrapper over `Number.isInteger` which is used by Lectern for identifying integers in data value type checks.
 * @param value
 * @returns
 */
export const isInteger = (value: unknown): value is number => Number.isInteger(value);

/**
 * Determines if a variables is of type number[], with add restriction that every element is an Integer.
 * @param value
 * @returns
 */
export const isIntegerArray = isArrayOf(isInteger);
