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

type CompareFunction<T> = (a: T, b: T) => number;

const defaultSort = <T>(a: T, b: T) => {
	return a > b ? 1 : -1;
};

/**
 * Wrapper for a search function that can define a priority order for specific values. This will return a
 * search function that will check if values are in the priorityArray, and if so will sort them in the
 * order found in the array. All values not found in the array will be sorted according to the provided
 * sortingFunction.
 * @param priorityArray Array of values in a specified priority sort order
 * @param sortingFunction Optional sorting function for case where neither value is found in the priorityArray.
 * Default sorting function is the defaultSort which does a JavaScript greater than operation to compare values.
 * @returns A new CompareFunction that will prioritize items found in the priorityArray.
 *
 * @example
 * ```
 * const array = ["c", "z", "x", "b", "a", "y"];
 * const customSortFunction = sortWithPriority(["z", "y", "x"]);
 *
 * const sortedArray = array.sort(customSortFunction);
 * // Result: ["z", "y", "x", "a", "b", "c"];
 * ```
 */
export const sortWithPriority =
	<T>(priorityArray: T[], sortingFunction: CompareFunction<T> = defaultSort): CompareFunction<T> =>
	(a, b) => {
		const indexA = priorityArray.indexOf(a);
		const indexB = priorityArray.indexOf(b);
		if (indexA >= 0) {
			if (indexB >= 0) {
				// Has A and B
				return indexA > indexB ? 1 : -1;
			} else {
				// Has A not B
				return -1;
			}
		} else if (indexB >= 0) {
			// Has B not A
			return 1;
		} else {
			// Has neither, use sortingFunction for remainder
			return sortingFunction(a, b);
		}
	};

/**
 * Create a deep clone of an object with all properties sorted. This is helpful for preparing a data structure
 * for presentation in a predictable way. For example, a user submitted JSON object will have
 * properties sorted randomly, while an API response that includes this user data should be always returned with
 * object properties in a consistent order.
 *
 * The sort order will by default be alphabetical. A custom sortingFunction can be provided to
 * sort the object properties with custom order or logic.
 *
 * Note: This only operates on own properties, not inherited properties.
 * @param input An object to be cloned with sorted properties
 * @param sortingFunction Optional property, a sorting function to determine the order of properties
 * in the output object
 * @returns Deep clone of the input object
 */
export const sortProperties = <T extends object>(input: T, sortingFunction = defaultSort): T => {
	const sortedEntries = Object.keys(input).sort(sortingFunction);
	return sortedEntries.reduce<any>((acc, key) => {
		const value = (input as any)[key];
		if (typeof value === 'object' && value !== null) {
			acc[key] = sortProperties(value, sortingFunction);
		} else {
			acc[key] = value;
		}
		return acc;
	}, {});
};
