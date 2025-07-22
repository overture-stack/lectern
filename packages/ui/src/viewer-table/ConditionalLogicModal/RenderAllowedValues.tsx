/** @jsxImportSource @emotion/react */
import { SchemaFieldRestrictions } from '@overture-stack/lectern-dictionary';
import React, { Fragment } from 'react';

import { css } from '@emotion/react';
import FieldBlock from '../../common/FieldBlock';
import ListItem from '../../common/ListItem';

export type RenderAllowedValuesProps = {
	restrictions: SchemaFieldRestrictions;
	currentSchemaFieldName: string;
};

const requiredMatch = (restrictions: SchemaFieldRestrictions) => {
	if (restrictions && 'required' in restrictions && restrictions.required !== undefined) {
		return <Fragment>be provided</Fragment>;
	}
	return undefined;
};

const regularExpressionMatch = (restrictions: SchemaFieldRestrictions) => {
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

const codeListMatch = (restrictions: SchemaFieldRestrictions) => {
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

const emptyMatch = (restrictions: SchemaFieldRestrictions) => {
	if (restrictions && 'empty' in restrictions && restrictions.empty !== undefined) {
		return <Fragment>be empty</Fragment>;
	}
	return undefined;
};

const CodeListContainer = ({ items }: { items: (string | number)[] }) => {
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

const RenderAllowedValues = ({ restrictions, currentSchemaFieldName }: RenderAllowedValuesProps) => {
	const computeRestrictions = [
		{
			condition: restrictions && 'required' in restrictions && restrictions.required !== undefined,
			content: requiredMatch(restrictions),
		},
		{
			condition: restrictions && 'regex' in restrictions && restrictions.regex !== undefined,
			content: regularExpressionMatch(restrictions),
		},
		{
			condition: restrictions && 'codeList' in restrictions && restrictions.codeList !== undefined,
			content: codeListMatch(restrictions),
		},
		{
			condition: restrictions && 'empty' in restrictions && restrictions.empty !== undefined,
			content: emptyMatch(restrictions),
		},
	];

	const computedRestrictionItems = computeRestrictions.filter((item) => item.condition && item.content);

	return (
		<div>
			{computedRestrictionItems.length > 0 ?
				<Fragment>
					<FieldBlock>{currentSchemaFieldName}</FieldBlock> must{' '}
					{computedRestrictionItems.map((item, index) => (
						<Fragment key={index}>
							{index > 0 && ', '}
							{item.content}
						</Fragment>
					))}
				</Fragment>
			:	<Fragment>No restrictions</Fragment>}
		</div>
	);
};

export default RenderAllowedValues;
