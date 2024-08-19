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

import type { DataRecordValue, MatchRuleCount } from '@overture-stack/lectern-dictionary';
import { testRange } from '../restrictions';

/**
 * Test if the number of elements in an array value is an exact number, or within a range.
 *
 * Note: This test is only meant to match on array fields. It is counting the number of elements in an array.
 *       This will always return false for non-array values, it does not count the character length of strings
 *       or numbers.
 * @param count
 * @param value
 * @returns
 */
export const testMatchCount = (count: MatchRuleCount, value: DataRecordValue): boolean => {
	if (!Array.isArray(value)) {
		// can only match with arrays
		return false;
	}

	// count match rule is either a range object or a number
	if (typeof count === 'object') {
		// here it is the range object so we can use the testRange fuctionality to determine if we have
		// the correct number of elements
		return testRange(count, value.length).valid;
	}

	// whats left
	return value.length === count;
};
