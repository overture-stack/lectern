/** @jsxImportSource @emotion/react */
import { SchemaField } from '@overture-stack/lectern-dictionary';
import { CellContext } from '@tanstack/react-table';
import Pill from '../../../../common/Pill';

export const renderDataTypeColumn = (type: CellContext<SchemaField, string>) => {
	const { valueType, isArray } = type.row.original;
	return <Pill>{isArray ? 'Array' : valueType}</Pill>;
};
