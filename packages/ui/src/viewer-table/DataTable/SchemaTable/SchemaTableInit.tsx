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

import { Schema, SchemaField, SchemaRestrictions } from '@overture-stack/lectern-dictionary';
import { CellContext, createColumnHelper, Row } from '@tanstack/react-table';

import { renderAllowedValuesColumn } from './Columns/AllowedValuesColumn/RenderAllowedValues';
import { renderAttributesColumn } from './Columns/Attribute';
import { renderDataTypeColumn } from './Columns/DataType';
import { FieldsColumn } from './Columns/Fields';

const columnHelper = createColumnHelper<SchemaField>();

export const getSchemaBaseColumns = (schema: Schema) => [
	columnHelper.accessor('name', {
		header: 'Fields',
		cell: (field: CellContext<SchemaField, string>) => {
			const fieldRow: Row<SchemaField> = field.row;
			return <FieldsColumn fieldRow={fieldRow} />;
		},
	}),

	columnHelper.accessor('restrictions.required', {
		header: 'Attribute',
		cell: (attribute: CellContext<SchemaField, unknown>) => {
			const schemaRestrictions: SchemaRestrictions = attribute.row.original.restrictions;
			return renderAttributesColumn(schemaRestrictions);
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
		cell: (restrictions: CellContext<SchemaField, SchemaRestrictions>) => {
			const schemaField: SchemaField = restrictions.row.original;
			const fieldLevelRestrictions = schemaField.restrictions;
			const schemaLevelRestrictions = schema.restrictions;

			return renderAllowedValuesColumn(fieldLevelRestrictions, schemaLevelRestrictions, schemaField);
		},
	}),
];
