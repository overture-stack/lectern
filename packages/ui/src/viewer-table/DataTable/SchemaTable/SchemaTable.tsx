import { Schema } from '@overture-stack/lectern-dictionary';
import React from 'react';
import Table from '../Table';
import { getSchemaBaseColumns } from './SchemaTableInit';

type schemaTableProps = {
	schema: Schema;
};
const SchemaTable = ({ schema }: schemaTableProps) => {
	return <Table data={schema.fields} columns={getSchemaBaseColumns()} />;
};

export default SchemaTable;
