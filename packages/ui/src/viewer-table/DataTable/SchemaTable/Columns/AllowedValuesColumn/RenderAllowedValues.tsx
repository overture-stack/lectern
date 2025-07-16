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
import { Schema, SchemaField, SchemaRestrictions } from '@overture-stack/lectern-dictionary';
import React, { ReactNode } from 'react';
import ReadMoreText from '../../../../../common/ReadMoreText';
import { computeAllowedValuesColumn, type RestrictionItem } from './ComputeAllowedValues';

const allowedValuesContainerStyle = css`
	display: flex;
	flex-direction: column;
	gap: 4px;
`;

const restrictionItemStyle = css`
	display: flex;
	flex-direction: column;
	gap: 4px;
`;

const prefixStyle = css`
	font-weight: bold;
	line-height: 1.4;
`;

const contentStyle = css`
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	align-items: center;
	line-height: 1.4;
`;

const renderRestrictionItem = (value: RestrictionItem, key: string): ReactNode => {
	const { prefix, content } = value;
	return (
		<ReadMoreText key={key} wrapperStyle={() => restrictionItemStyle}>
			{prefix.length > 0 && <div css={prefixStyle}>{prefix.join(' ')}</div>}
			{content.length > 0 && (
				<div css={() => contentStyle}>
					{content.map((item, index) => (
						<span key={index}>{item}</span>
					))}
				</div>
			)}
		</ReadMoreText>
	);
};

export const renderAllowedValuesColumn = (
	fieldLevelRestrictions: SchemaRestrictions,
	schemaLevelRestrictions: Schema['restrictions'],
	currentSchemaField: SchemaField,
) => {
	const items = computeAllowedValuesColumn(fieldLevelRestrictions, schemaLevelRestrictions, currentSchemaField);
	if (!items || Object.keys(items).length === 0) {
		return <strong>None</strong>;
	}

	return (
		<ReadMoreText wrapperStyle={() => allowedValuesContainerStyle}>
			{Object.entries(items).map(([key, value]) => {
				if (value && typeof value === 'object' && 'prefix' in value && 'content' in value) {
					return renderRestrictionItem(value, key);
				}
				if (value) {
					return <div key={key}>{value}</div>;
				}
				return null;
			})}
		</ReadMoreText>
	);
};
