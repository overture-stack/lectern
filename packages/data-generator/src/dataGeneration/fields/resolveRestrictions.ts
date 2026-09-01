/*
 * Copyright (c) 2026 The Ontario Institute for Cancer Research. All rights reserved
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

import {
	isConditionalRestriction,
	type ConditionalRestriction,
	type DataRecord,
	type RestrictionRange,
	type RestrictionRegex,
} from '@overture-stack/lectern-dictionary';
import { testConditionalRestriction } from '@overture-stack/lectern-validation';

/* ************************** *
 * Collected Restrictions     *
 * ************************** */

/**
 * All active (non-conditional) restriction values collected by type, after resolving all conditional
 * branches. Each array contains one entry per active restriction object that specified that key.
 */
export type CollectedRestrictions = {
	codeList: (string | number)[][];
	empty: boolean[];
	range: RestrictionRange[];
	regex: RestrictionRegex[];
	required: boolean[];
};

type AnyRestrictionObject = {
	codeList?: unknown;
	empty?: boolean;
	range?: RestrictionRange;
	regex?: RestrictionRegex;
	required?: boolean;
};

const emptyCollected = (): CollectedRestrictions => ({
	codeList: [],
	empty: [],
	range: [],
	regex: [],
	required: [],
});

const mergeCollected = (target: CollectedRestrictions, source: CollectedRestrictions): CollectedRestrictions => ({
	codeList: [...target.codeList, ...source.codeList],
	empty: [...target.empty, ...source.empty],
	range: [...target.range, ...source.range],
	regex: [...target.regex, ...source.regex],
	required: [...target.required, ...source.required],
});

const collectFromPlainRestriction = (restriction: AnyRestrictionObject): CollectedRestrictions => {
	const collected = emptyCollected();
	if (restriction.codeList !== undefined) {
		collected.codeList.push(restriction.codeList as (string | number)[]);
	}
	if (restriction.empty !== undefined) {
		collected.empty.push(restriction.empty);
	}
	if (restriction.range !== undefined) {
		collected.range.push(restriction.range);
	}
	if (restriction.regex !== undefined) {
		collected.regex.push(restriction.regex);
	}
	if (restriction.required !== undefined) {
		collected.required.push(restriction.required);
	}
	return collected;
};

/**
 * Recursively traverse a field's restrictions, evaluating all conditional branches against the
 * partial record, and collect all active non-conditional restriction values grouped by type.
 *
 * Each entry in the returned arrays represents one active restriction object that specified that key.
 * Missing fields in `record` are treated as `undefined` when evaluating conditions. The returned
 * `CollectedRestrictions` is then passed to the per-type reducers in `restrictionReducers.ts` to
 * produce a single merged value for each restriction type.
 */
export const collectRestrictions = <TRestrictions extends object>(
	restrictions:
		| TRestrictions
		| ConditionalRestriction<TRestrictions>
		| (TRestrictions | ConditionalRestriction<TRestrictions>)[]
		| undefined,
	record: DataRecord,
): CollectedRestrictions => {
	if (restrictions === undefined) {
		return emptyCollected();
	}

	const entries = Array.isArray(restrictions) ? restrictions : [restrictions];
	let collected = emptyCollected();

	for (const entry of entries) {
		if (isConditionalRestriction(entry)) {
			const conditionPasses = testConditionalRestriction(entry.if, undefined, record);
			const branchCollected = collectRestrictions<TRestrictions>(conditionPasses ? entry.then : entry.else, record);
			collected = mergeCollected(collected, branchCollected);
		} else {
			const plain = collectFromPlainRestriction(entry);
			collected = mergeCollected(collected, plain);
		}
	}

	return collected;
};
