/*
 * Copyright (c) 2025 The Ontario Institute for Cancer Research. All rights reserved
 *
 *  This program and the accompanying materials are made available under the terms of
 *  the GNU Affero General Public License v3.0. You should have received a copy of the
 *  GNU Affero General Public License along with this program.
 *   If not, see <http://www.gnu.org/licenses/>.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 *  SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 *  TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 *  OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 *  IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 *  ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/** @jsxImportSource @emotion/react */
import { MatchRuleCount, RestrictionRange, SchemaField, SchemaRestrictions } from '@overture-stack/lectern-dictionary';
import { CellContext } from '@tanstack/react-table';

export type AllowedValuesColumnProps = {
	restrictions: CellContext<SchemaField, SchemaRestrictions>;
};

const handleRange = (range: RestrictionRange, restrictionItems: string[]): void => {
	if (range.min !== undefined && range.max !== undefined) {
		restrictionItems.push(`Min: ${range.min}\nMax: ${range.max}`);
	} else if (range.min !== undefined) {
		restrictionItems.push(`Min: ${range.min}`);
	} else if (range.max !== undefined) {
		restrictionItems.push(`Max: ${range.max}`);
	} else if (range.exclusiveMin !== undefined) {
		restrictionItems.push(`Greater than ${range.exclusiveMin}`);
	} else if (range.exclusiveMax !== undefined) {
		restrictionItems.push(`Less than ${range.exclusiveMax}`);
	}
};

const handleCodeListsWithCountRestrictions = (
	codeList: string | string[] | number[],
	count: MatchRuleCount,
	restrictionItems: string[],
	isArray: boolean,
	delimiter: string = ',',
): void => {
	const codeListDisplay = Array.isArray(codeList) ? codeList.join(', ') : codeList;
	const delimiterText = isArray ? `, delimited by "${delimiter}"` : '';

	if (typeof count === 'number') {
		restrictionItems.push(`Exactly ${count}${delimiterText} from:\n${codeListDisplay}`);
	} else {
		if (count.min !== undefined && count.max !== undefined) {
			restrictionItems.push(`Select ${count.min} to ${count.max}${delimiterText} from:\n${codeListDisplay}`);
		} else if (count.min !== undefined) {
			restrictionItems.push(`At least ${count.min}${delimiterText} from:\n${codeListDisplay}`);
		} else if (count.max !== undefined) {
			restrictionItems.push(`Up to ${count.max}${delimiterText} from:\n${codeListDisplay}`);
		} else if (count.exclusiveMin !== undefined) {
			restrictionItems.push(`More than ${count.exclusiveMin}${delimiterText} from:\n${codeListDisplay}`);
		} else if (count.exclusiveMax !== undefined) {
			restrictionItems.push(`Fewer than ${count.exclusiveMax}${delimiterText} from:\n${codeListDisplay}`);
		}
	}
};

export const renderAllowedValuesColumn = (restrictions: CellContext<SchemaField, SchemaRestrictions>): string => {
	const schemaField: SchemaField = restrictions.row.original;
	const restrictionsValue: SchemaRestrictions = restrictions.getValue();
	const restrictionItems: string[] = [];

	if (!restrictionsValue || Object.keys(restrictionsValue).length === 0) {
		return 'None';
	}

	if ('if' in restrictionsValue && restrictionsValue.if) {
		restrictionItems.push('Depends on');
	}

	if ('regex' in restrictionsValue && restrictionsValue.regex) {
		const regexValue =
			Array.isArray(restrictionsValue.regex) ? restrictionsValue.regex.join(', ') : restrictionsValue.regex;
		restrictionItems.push(`Must match pattern: ${regexValue}\nSee field description for examples.`);
	}

	if ('codeList' in restrictionsValue && restrictionsValue.codeList && !('count' in restrictionsValue)) {
		const codeListDisplay =
			Array.isArray(restrictionsValue.codeList) ?
				restrictionsValue.codeList.join(',\n')
			:	`"${restrictionsValue.codeList}"`;
		restrictionItems.push('One of:\n' + `${codeListDisplay}`);
	}

	if ('range' in restrictionsValue && restrictionsValue.range) {
		handleRange(restrictionsValue.range, restrictionItems);
	}

	if (
		'codeList' in restrictionsValue &&
		restrictionsValue.codeList &&
		'count' in restrictionsValue &&
		restrictionsValue.count
	) {
		handleCodeListsWithCountRestrictions(
			restrictionsValue.codeList,
			restrictionsValue.count,
			restrictionItems,
			schemaField.isArray || false,
			schemaField.delimiter ?? ',',
		);
	}

	if (schemaField.unique) {
		restrictionItems.push('Must be unique');
	}

	return restrictionItems.length > 0 ? restrictionItems.join('\n') : 'None';
};
