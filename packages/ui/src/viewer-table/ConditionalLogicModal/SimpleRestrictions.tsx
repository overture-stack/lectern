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

import { SchemaField, SchemaFieldRestrictions, TypeUtils } from '@overture-stack/lectern-dictionary';

import RenderAllowedValues from './RenderAllowedValues';

/**
 * Determines the type of field restrictions
 * @param restrictions - The field restrictions to analyze
 * @returns {'conditional' | 'simple' | undefined} The type of restrictions or undefined if invalid
 */
const getRestrictionType = (restrictions: SchemaFieldRestrictions) => {
	if (restrictions !== undefined && typeof restrictions === 'object') {
		return 'if' in restrictions ? 'conditional' : 'simple';
	}
	return undefined;
};

/**
 * Extracts code list from a field restriction
 * @param restriction - The field restriction to extract from
 * @returns {any | undefined} The code list or undefined if not present
 */
const extractCodeList = (restriction: SchemaFieldRestrictions) => {
	return restriction && 'codeList' in restriction && restriction.codeList !== undefined ?
			restriction.codeList
		:	undefined;
};

/**
 * Extracts regex pattern from field restrictions
 * @param restrictions - The field restrictions to extract from
 * @returns {string | undefined} The regex pattern or undefined if not present
 */
const extractRegex = (restrictions: SchemaFieldRestrictions) => {
	return restrictions && 'regex' in restrictions && restrictions.regex !== undefined ? restrictions.regex : undefined;
};

/**
 * Extracts and converts code lists from multiple restrictions to sets
 * @param restrictions - Array of field restrictions to process
 * @returns {Set<string>[]} Array of sets containing code list values
 */
const getCodeListsFromRestrictions = (restrictions: SchemaFieldRestrictions[]) => {
	return restrictions
		.map(extractCodeList)
		.filter((item) => item !== undefined)
		.map((item) => new Set<string>(Array.isArray(item) ? item.map((x) => x.toString()) : [item.toString()]));
};

/**
 * Extracts regex patterns from multiple restrictions
 * @param restrictions - Array of field restrictions to process
 * @returns {string[]} Array of regex patterns
 */
const getRegularExpressionPatternsFromRestrictions = (restrictions: SchemaFieldRestrictions[]) => {
	return restrictions.flatMap(extractRegex).filter((item) => item !== undefined);
};

/**
 * Finds the intersection of multiple sets
 * TODO: Remove when codebase has newest version of TypeScript, which has the intersection method of a set
 * @param sets - Array of sets to find intersection of
 * @returns {Set<string>} Set containing elements present in all input sets
 */
const intersection = (sets: Set<string>[]) => {
	return sets.length > 0 ?
			sets.reduce((acc, currSet) => new Set([...acc].filter((item) => currSet.has(item))))
		:	new Set<string>();
};

/**
 * Merges multiple simple restrictions into a single restriction object
 * @param simpleRestrictions - Array of simple field restrictions to merge
 * @returns {SchemaFieldRestrictions} Merged restriction object
 */
const mergeSimpleRestrictions = (simpleRestrictions: SchemaFieldRestrictions[]) => {
	const codeLists = Array.from(intersection(getCodeListsFromRestrictions(simpleRestrictions)));
	const regularExpressionPatterns = getRegularExpressionPatternsFromRestrictions(simpleRestrictions);
	const isRequired = simpleRestrictions.some(
		(restriction) => restriction && 'required' in restriction && restriction.required === true,
	);
	const isEmpty = simpleRestrictions.some(
		(restriction) => restriction && 'empty' in restriction && restriction.empty === true,
	);

	return {
		codeList: codeLists.length > 0 ? codeLists : undefined,
		regex: regularExpressionPatterns.length > 0 ? regularExpressionPatterns : undefined,
		required: isRequired,
		empty: isEmpty,
	};
};

export type SimpleRestrictionsRendererProps = {
	restrictions: SchemaFieldRestrictions[];
	currentSchemaField: SchemaField;
};

/**
 * Renders simple field restrictions (non-conditional)
 * @param restrictions - The field restrictions to display
 * @param currentSchemaField - The schema field being described
 * @returns The rendered simple restrictions or null
 */
export const SimpleRestrictions = ({ restrictions, currentSchemaField }: SimpleRestrictionsRendererProps) => {
	if (restrictions === undefined) {
		return null;
	}

	const mergedSimpleRestrictions = mergeSimpleRestrictions(restrictions);

	return RenderAllowedValues({
		restrictions: mergedSimpleRestrictions,
		currentSchemaField,
	});
};
