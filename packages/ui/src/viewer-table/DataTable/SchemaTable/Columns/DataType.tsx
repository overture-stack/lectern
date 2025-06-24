/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { SchemaField } from '@overture-stack/lectern-dictionary';
import { CellContext } from '@tanstack/react-table';
import React from 'react';
import Pill from '../../../../common/Pill';

const containerStyle = css`
	display: flex;
	align-items: center;
	flex-direction: column;
	gap: 10px;
`;
export const renderDataTypeColumn = (type: CellContext<SchemaField, string>) => {
	const { valueType, isArray, unique } = type.row.original;
	const renderContent = () => {
		return isArray ? 'Array' : valueType.charAt(0).toUpperCase() + valueType.slice(1);
	};
	return (
		<div css={containerStyle}>
			<Pill dark={true}>{renderContent()}</Pill>
			{unique === true && <Pill dark={true}>Unique</Pill>}
		</div>
	);
};
