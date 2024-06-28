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

import { RestrictionRange } from 'dictionary';

export const rangeToText = (range: RestrictionRange): string => {
	let minString = '';
	let maxString = '';

	const hasBothRange =
		(range.min !== undefined || range.exclusiveMin !== undefined) &&
		(range.max !== undefined || range.exclusiveMax !== undefined);

	// The order here is intentionally putting exclusiveMin/exclusiveMax before the simple min/max.
	// If a RestrictionRange is created with both min and exclusiveMin (or max and exclusiveMax),
	// the generated text will use the more restrictive rule
	if (range.exclusiveMin !== undefined) {
		minString = `> ${range.exclusiveMin}`;
	}

	if (range.min !== undefined) {
		minString = `>= ${range.min}`;
	}

	if (range.exclusiveMax !== undefined) {
		maxString = `< ${range.exclusiveMax}`;
	}

	if (range.max !== undefined) {
		maxString = `<= ${range.max}`;
	}

	return hasBothRange ? `${minString} and ${maxString}` : `${minString}${maxString}`;
};
