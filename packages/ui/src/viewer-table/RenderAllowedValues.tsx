import { SchemaFieldRestrictions } from '@overture-stack/lectern-dictionary';
import React, { Fragment } from 'react';

import ListItem from '../common/ListItem';

const renderRequired = (restrictions: SchemaFieldRestrictions) => {
	if (restrictions && 'required' in restrictions && restrictions.required !== undefined) {
		return <Fragment>be provided</Fragment>;
	}
	return <Fragment></Fragment>;
};

const renderRegularExpression = (restrictions: SchemaFieldRestrictions) => {
	if (restrictions && 'regex' in restrictions && restrictions.regex !== undefined) {
		return (
			<Fragment>
				match the {Array.isArray(restrictions.regex) ? 'patterns' : 'pattern'}{' '}
				{Array.isArray(restrictions.regex) ? restrictions.regex.join(', ') : restrictions.regex}
			</Fragment>
		);
	}
	return <Fragment></Fragment>;
};

const CodeListContainer = ({ items }: { items: (string | number)[] }) => {
	return (
		<div
			style={{
				display: 'inline-flex',
				flexWrap: 'wrap',
				gap: '8px',
				maxWidth: '100%',
				verticalAlign: 'top',
			}}
		>
			{items.map((item, index) => (
				<ListItem key={index}>{String(item)}</ListItem>
			))}
		</div>
	);
};

const renderCodeList = (restrictions: SchemaFieldRestrictions) => {
	if (restrictions && 'codeList' in restrictions && restrictions.codeList !== undefined) {
		const items = Array.isArray(restrictions.codeList) ? restrictions.codeList : [restrictions.codeList];
		return (
			<Fragment>
				<span style={{ whiteSpace: 'nowrap' }}>be one of</span> <CodeListContainer items={items} />
			</Fragment>
		);
	}
	return <Fragment></Fragment>;
};

const renderEmpty = (restrictions: SchemaFieldRestrictions) => {
	if (restrictions && 'empty' in restrictions && restrictions.empty !== undefined) {
		return <Fragment>be empty</Fragment>;
	}
	return <Fragment></Fragment>;
};

const RenderAllowedValues = ({ restrictions }: { restrictions: SchemaFieldRestrictions }) => {
	const renderedRestrictions = [
		renderRequired(restrictions),
		renderRegularExpression(restrictions),
		renderCodeList(restrictions),
		renderEmpty(restrictions),
	].filter((restriction) => restriction.props.children !== '' && restriction.props.children !== undefined);

	return (
		<div>
			{renderedRestrictions.length > 0 ?
				<Fragment>
					Field must{' '}
					{renderedRestrictions.map((restriction, index) => (
						<Fragment key={index}>
							{restriction}
							{index < renderedRestrictions.length - 1 && ', '}
						</Fragment>
					))}
				</Fragment>
			:	<Fragment>No restrictions</Fragment>}
		</div>
	);
};

export default RenderAllowedValues;
