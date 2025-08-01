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

import { css } from '@emotion/react';
import { SchemaField, SchemaFieldRestrictions } from '@overture-stack/lectern-dictionary';
import { Fragment } from 'react';

import FieldBlock from '../../common/FieldBlock';
import ListItem from '../../common/ListItem';
import { isFieldRequired } from '../../utils/isFieldRequired';

export type RenderAllowedValuesProps = {
	restrictions: SchemaFieldRestrictions;
	currentSchemaField: SchemaField;
};

export type CodeListContainerProps = {
	items: (string | number)[];
};

const handleRegularExpression = (restrictions: SchemaFieldRestrictions) => {
	if (restrictions && 'regex' in restrictions && restrictions.regex !== undefined) {
		return (
			<Fragment>
				match the {Array.isArray(restrictions.regex) ? 'patterns' : 'pattern'}{' '}
				{Array.isArray(restrictions.regex) ? restrictions.regex.join(', ') : restrictions.regex}
			</Fragment>
		);
	}
	return undefined;
};

const handleCodeList = (restrictions: SchemaFieldRestrictions) => {
	if (restrictions && 'codeList' in restrictions && restrictions.codeList !== undefined) {
		const items = Array.isArray(restrictions.codeList) ? restrictions.codeList : [restrictions.codeList];
		return (
			<Fragment>
				<span
					css={css`
						white-space: nowrap;
						margin-bottom: 4px;
					`}
				>
					be one of
				</span>{' '}
				<CodeListContainer items={items} />
			</Fragment>
		);
	}
	return undefined;
};

const emptyRestriction = (restrictions: SchemaFieldRestrictions) => {
	if (restrictions && 'empty' in restrictions && restrictions.empty === true) {
		return <Fragment>be empty</Fragment>;
	}
	return undefined;
};

const CodeListContainer = ({ items }: CodeListContainerProps) => {
	return (
		<div
			css={css`
				display: inline-flex;
				flex-wrap: wrap;
				gap: 4px;
				max-width: 100%;
				vertical-align: top;
			`}
		>
			{items.map((item, index) => (
				<ListItem key={index}>{String(item)}</ListItem>
			))}
		</div>
	);
};

/**
 * Renders human-readable field restrictions including required , regex patterns, and code lists.
 *
 * @param restrictions - The field restrictions to display
 * @param currentSchemaField - The schema field being described
 */

const RenderAllowedValues = ({ restrictions, currentSchemaField }: RenderAllowedValuesProps) => {
	if (restrictions === undefined) {
		return <Fragment>No restrictions</Fragment>;
	}
	const computeRestrictions = [
		{
			condition: isFieldRequired(currentSchemaField),
			content: <Fragment>be provided</Fragment>,
		},
		{
			condition: 'regex' in restrictions && restrictions.regex !== undefined,
			content: handleRegularExpression(restrictions),
		},
		{
			condition: 'codeList' in restrictions && restrictions.codeList !== undefined,
			content: handleCodeList(restrictions),
		},
		{
			condition: 'empty' in restrictions && restrictions.empty !== undefined,
			content: emptyRestriction(restrictions),
		},
	];

	const computedRestrictionItems = computeRestrictions.filter((item) => item.condition && item.content);

	return (
		<div>
			{computedRestrictionItems.length > 0 && (
				<Fragment>
					<FieldBlock>{currentSchemaField.name}</FieldBlock> must{' '}
					{computedRestrictionItems.map((item, index) => (
						<Fragment key={index}>
							{index > 0 && ' and '}
							{item.content}
						</Fragment>
					))}
				</Fragment>
			)}
		</div>
	);
};

export default RenderAllowedValues;
