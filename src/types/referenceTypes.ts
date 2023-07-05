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

import { z as zod } from 'zod';

export const ReferenceTag = zod
	.string()
	.regex(
		RegExp('^#(/[-_A-Za-z0-9]+)+$'),
		'Not formatted as a valid reference tag. References must be formatted like `#/path/to/reference',
	);
export type ReferenceTag = zod.infer<typeof ReferenceValue>;

export const ReferenceValue = zod.string();
export type ReferenceValue = zod.infer<typeof ReferenceValue>;
export const ReferenceArray = zod
	.array(zod.union([ReferenceValue, ReferenceTag]))
	.min(1, 'Arrays of references must have at least 1 value.');
export type ReferenceArray = zod.infer<typeof ReferenceArray>;

// References are recursive, but Zod can't do TS type inference for recursive definitions.
// So in this one case we define the type first with the recursive structure and use it as a type-hint
// for our zod schema. Reference: https://zod.dev/?id=recursive-types
export type References = { [x: string]: ReferenceArray | ReferenceValue | References };
export const References: zod.ZodType<References> = zod.record(
	zod.union([ReferenceValue, ReferenceArray, zod.lazy(() => References)]), //TODO: test this please.
);
