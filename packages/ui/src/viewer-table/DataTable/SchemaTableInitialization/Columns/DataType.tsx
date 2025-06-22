/** @jsxImportSource @emotion/react */
import { SchemaField } from '@overture-stack/lectern-dictionary';
import { CellContext } from '@tanstack/react-table';
import Pill from '../../../../common/Pill';

export const renderDataTypeColumn = (type: CellContext<SchemaField, string>) => {
	const { valueType, isArray, delimiter } = type.row.original;
	return (
		<Pill>
			{isArray ? `Array delimited by "${delimiter}"` : valueType.charAt(0).toUpperCase() + valueType.slice(1)}
		</Pill>
	);
};
