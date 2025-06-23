/** @jsxImportSource @emotion/react */
import { SchemaField } from '@overture-stack/lectern-dictionary';
import { CellContext } from '@tanstack/react-table';
import React from 'react';
import Pill from '../../../../common/Pill';
import { css } from '@emotion/react';

const containerStyle = () => css`
	display: flex;
	flex-direction: column;
	gap: 10px;
`;
export const renderDataTypeColumn = (type: CellContext<SchemaField, string>) => {
	const { valueType, isArray, delimiter, unique } = type.row.original;
	const renderContent = () => {
		return isArray ?
				<span>
					Array with
					<br />
					Delimiter "{delimiter}"
				</span>
			:	valueType.charAt(0).toUpperCase() + valueType.slice(1);
	};
	return (
		<div css={containerStyle}>
			<Pill dark={true}>{renderContent()}</Pill>
			{unique === true && <Pill dark={true}>Unique</Pill>}
		</div>
	);
};
