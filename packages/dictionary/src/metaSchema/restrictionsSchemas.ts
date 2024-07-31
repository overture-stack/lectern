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

import { z as zod } from 'zod';
import { ReferenceTag } from './referenceSchemas';
import { Integer } from './dictionarySchemas';
import type { Values } from '../types';

export const FieldRestrictionTypes = {
	codeList: 'codeList',
	range: 'range',
	required: 'required',
	regex: 'regex',
	script: 'script',
	unique: 'unique',
} as const;
export type FieldRestrictionType = Values<typeof FieldRestrictionTypes>;

export const RestrictionScript = zod.array(zod.string().or(ReferenceTag)).min(1); //TODO: script formatting validation
export type RestrictionScript = zod.infer<typeof RestrictionScript>;

export const RestrictionCodeListString = zod.union([zod.string(), ReferenceTag]).array().min(1);
export type RestrictionCodeListString = zod.infer<typeof RestrictionCodeListString>;

export const RestrictionCodeListNumber = zod.number().array().min(1);
export type RestrictionCodeListNumber = zod.infer<typeof RestrictionCodeListNumber>;

export const RestrictionCodeListInteger = Integer.array().min(1);
export type RestrictionCodeListInteger = zod.infer<typeof RestrictionCodeListInteger>;

export type RestrictionCodeList = RestrictionCodeListString | RestrictionCodeListNumber | RestrictionCodeListInteger;

export const RestrictionNumberRange = zod
	.object({
		exclusiveMax: zod.number().optional(),
		exclusiveMin: zod.number().optional(),
		max: zod.number().optional(),
		min: zod.number().optional(),
	})
	.refine(
		(data) =>
			data.exclusiveMax !== undefined ||
			data.max !== undefined ||
			data.exclusiveMin !== undefined ||
			data.min !== undefined,
		'Range restriction requires one of `exclusiveMax`, `exclusiveMin`, `max` or `min`.',
	)
	.refine(
		(data) => !(data.exclusiveMin !== undefined && data.min !== undefined),
		'Range restriction cannot have both `exclusiveMin` and `min`.',
	)
	.refine(
		(data) => !(data.exclusiveMax !== undefined && data.max !== undefined),
		'Range restriction cannot have both `exclusiveMax` and `max`.',
	);

export const RestrictionIntegerRange = zod
	.object({
		exclusiveMax: Integer.optional(),
		exclusiveMin: Integer.optional(),
		max: Integer.optional(),
		min: Integer.optional(),
	})
	.refine(
		(data) =>
			data.exclusiveMax !== undefined ||
			data.max !== undefined ||
			data.exclusiveMin !== undefined ||
			data.min !== undefined,
		'Range restriction requires one of `exclusiveMax`, `exclusiveMin`, `max` or `min`.',
	)
	.refine(
		(data) => !(data.exclusiveMin !== undefined && data.min !== undefined),
		'Range restriction cannot have both `exclusiveMin` and `min`.',
	)
	.refine(
		(data) => !(data.exclusiveMax !== undefined && data.max !== undefined),
		'Range restriction cannot have both `exclusiveMax` and `max`.',
	);

export const RestrictionRange = RestrictionNumberRange;
export type RestrictionRange = zod.infer<typeof RestrictionIntegerRange>;

export const RestrictionRegex = zod.string().superRefine((data, context) => {
	try {
		// Attempt to build regexp from the value
		RegExp(data);
	} catch (e) {
		// Thrown error creating regex, so we add validation issue.
		const errorMessage = e instanceof Error ? e.message : `${e}`;
		context.addIssue({
			code: zod.ZodIssueCode.custom,
			message: `Error converting expression to Regex: ${errorMessage}`,
		});
	}
});
export type RestrictionRegex = zod.infer<typeof RestrictionRegex>;
