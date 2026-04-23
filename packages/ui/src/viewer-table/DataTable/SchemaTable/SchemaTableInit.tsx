/*
 *
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
 *
 */

/** @jsxImportSource @emotion/react */

import type { DictionaryMeta, DictionaryMetaValue } from '@overture-stack/lectern-dictionary';
import { Schema, SchemaField, SchemaFieldRestrictions } from '@overture-stack/lectern-dictionary';
import { CellContext, createColumnHelper, Row } from '@tanstack/react-table';
import { getByDotPath } from '../../../utils/getByDotPath.js';
import type { CustomColumnConfig } from '../../customColumnTypes.js';
import { renderAllowedValuesColumn } from './Columns/AllowedValuesColumn/RenderAllowedValues';
import { renderAttributesColumn } from './Columns/Attribute';
import { renderDataTypeColumn } from './Columns/DataType';
import { FieldsColumn } from './Columns/Fields';
import MetaValueRenderer from './Columns/MetaValueRenderer';

const columnHelper = createColumnHelper<SchemaField>();

const isDictionaryMetaValueOrMeta = (value: unknown): value is DictionaryMetaValue | DictionaryMeta => {
	if (value == null) {
		return false;
	}

	if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
		return true;
	}

	if (Array.isArray(value)) {
		return value.every((item) => typeof item === 'string' || typeof item === 'number');
	}

	if (typeof value === 'object') {
		return true;
	}
	
	return false;
};

/**
 * Creates base column definitions for schema table display.
 * @param {Schema} schema - Dictionary schema containing field definitions and restrictions
 * @param {CustomColumnConfig[]} customColumns - Optional custom column configurations
 * @returns {ColumnDef<SchemaField, any>[]} Array of TanStack table column definitions for Fields, Attribute, Data Type, Allowed Values, and any custom columns
 */

export const getSchemaBaseColumns = (schema: Schema, customColumns?: CustomColumnConfig[]) => [
	columnHelper.accessor('name', {
		header: 'Fields',
		cell: (field: CellContext<SchemaField, string>) => {
			const fieldRow: Row<SchemaField> = field.row;
			return <FieldsColumn fieldRow={fieldRow} schemaName={schema.name} />;
		},
	}),

	columnHelper.accessor('restrictions.required', {
		header: 'Attribute',
		cell: (attribute: CellContext<SchemaField, unknown>) => {
			const schemaField: SchemaField = attribute.row.original;
			const fieldLevelRestrictions: SchemaFieldRestrictions = schemaField.restrictions;
			return renderAttributesColumn(fieldLevelRestrictions, schemaField, schema);
		},
	}),

	columnHelper.accessor('valueType', {
		header: 'Data Type',
		cell: (type: CellContext<SchemaField, string>) => {
			const schemaField: SchemaField = type.row.original;
			return renderDataTypeColumn(schemaField);
		},
	}),

	columnHelper.accessor((row: SchemaField) => row.restrictions, {
		id: 'allowedValues',
		header: 'Allowed Values',
		cell: (restrictions: CellContext<SchemaField, SchemaFieldRestrictions>) => {
			const schemaField: SchemaField = restrictions.row.original;
			const fieldLevelRestrictions = schemaField.restrictions;
			const schemaLevelRestrictions = schema.restrictions;

			return renderAllowedValuesColumn(fieldLevelRestrictions, schemaLevelRestrictions, schemaField, schema);
		},
	}),

	...(customColumns ?? []).map((config, index) =>
		columnHelper.display({
			id: `custom-${index}-${config.columnHeader}`,
			header: config.columnHeader,
			cell: (cellContext: CellContext<SchemaField, unknown>) => {
				const field = cellContext.row.original;
				const metaPath = config.metaPath;
				const Component = config.columnComponent;
				const value = metaPath !== undefined ? getByDotPath(field, metaPath) : undefined;

				if (!Component) {
					return <MetaValueRenderer value={value} />;
				}

				return (
					<Component field={field} metaPath={metaPath} value={isDictionaryMetaValueOrMeta(value) ? value : undefined} />
				);
			},
		}),
	),
];


