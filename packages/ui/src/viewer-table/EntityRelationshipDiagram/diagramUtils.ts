/*
 *
 * Copyright (c) 2026 The Ontario Institute for Cancer Research. All rights reserved
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

import type { Dictionary, Schema } from '@overture-stack/lectern-dictionary';
import { type Edge, type Node, MarkerType } from 'reactflow';
import { ONE_CARDINALITY_MARKER_ID } from '../../theme/icons/OneCardinalityMarker';

export type SchemaFlowNode = Node<Schema, 'schema'>;

export type SchemaNodeLayout = {
	maxColumns: number;
	columnWidth: number;
	rowHeight: number;
};

function buildSchemaNode(schema: Schema): Omit<SchemaFlowNode, 'position'> {
	return {
		id: schema.name,
		type: 'schema',
		data: schema,
	};
}

export function getNodesForDictionary(dictionary: Dictionary, layout?: Partial<SchemaNodeLayout>): Node[] {
	const maxColumns = layout?.maxColumns ?? 4;
	const columnWidth = layout?.columnWidth ?? 500;
	const rowHeight = layout?.rowHeight ?? 500;

	return dictionary.schemas.map((schema, index) => {
		const partialNode = buildSchemaNode(schema);

		const row = Math.floor(index / maxColumns);
		const col = index % maxColumns;

		const position: Node['position'] = {
			x: col * columnWidth,
			y: row * rowHeight,
		};

		return { ...partialNode, position };
	});
}

export const createFieldHandleId = (schemaName: string, fieldName: string, type: 'source' | 'target'): string =>
	`${schemaName}-${fieldName}-${type}`;

export function getEdgesForDictionary(dictionary: Dictionary): Edge[] {
	return dictionary.schemas.flatMap((schema) => {
		if (!schema.restrictions?.foreignKey) return [];

		return schema.restrictions.foreignKey.flatMap((foreignKey) => {
			return foreignKey.mappings.map((mapping) => ({
				id: `${schema.name}-${mapping.local}-to-${foreignKey.schema}-${mapping.foreign}`,
				source: foreignKey.schema,
				sourceHandle: createFieldHandleId(foreignKey.schema, mapping.foreign, 'source'),
				target: schema.name,
				targetHandle: createFieldHandleId(schema.name, mapping.local, 'target'),
				type: 'smoothstep',
				style: { stroke: '#374151', strokeWidth: 2 },
				pathOptions: {
					offset: -20,
				},
				markerEnd: {
					type: MarkerType.Arrow,
					width: 20,
					height: 20,
					color: '#374151',
				},
				markerStart: ONE_CARDINALITY_MARKER_ID,
			}));
		});
	});
}
