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
import { ONE_CARDINALITY_MARKER_ID, ONE_CARDINALITY_MARKER_ACTIVE_ID } from '../../theme/icons/OneCardinalityMarker';

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

export const createFieldHandleId = (schemaName: string, fieldName: string, type: 'source' | 'target'): string =>
	`${schemaName}-${fieldName}-${type}`;

type FkRestrictionInfo = {
	localSchema: string;
	foreignSchema: string;
	mappings: { localField: string; foreignField: string }[];
	edgeIds: string[];
	fieldKeys: string[];
	localFieldKeys: string[];
	foreignFieldKeys: string[];
};

export type RelationshipEdgeData = { fkIndex: number };

export type RelationshipMap = {
	fkRestrictions: FkRestrictionInfo[];
	localFieldKeyToFkIndices: Map<string, number[]>;
	foreignFieldKeyToFkIndices: Map<string, number[]>;
	fieldKeyToFkIndices: Map<string, number[]>;
};

/**
 * Converts a dictionary's schemas into positioned ReactFlow nodes arranged in a grid layout.
 *
 * @param {Dictionary} dictionary — The Lectern dictionary containing schemas to visualize
 * @param {Partial<SchemaNodeLayout>} layout — Optional overrides for grid layout configuration
 * @returns {Node[]} Array of positioned ReactFlow nodes
 */
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

/**
 * Builds an FK adjacency graph from the dictionary's foreign key restrictions.
 * Each FK restriction is indexed, and adjacency maps allow tracing chains
 * up (child→parent) and down (parent→child).
 *
 * @param {Dictionary} dictionary — The Lectern dictionary containing schemas with foreign key restrictions
 * @returns {RelationshipMap} FK adjacency graph for chain tracing
 */
export function buildRelationshipMap(dictionary: Dictionary): RelationshipMap {
	const fkRestrictions: FkRestrictionInfo[] = [];
	const localFieldKeyToFkIndices = new Map<string, number[]>();
	const foreignFieldKeyToFkIndices = new Map<string, number[]>();
	const fieldKeyToFkIndices = new Map<string, number[]>();

	const addToList = (map: Map<string, number[]>, key: string, index: number) => {
		const existing = map.get(key) ?? [];
		existing.push(index);
		map.set(key, existing);
	};

	dictionary.schemas.forEach((schema) => {
		if (!schema.restrictions?.foreignKey) {
			return;
		}
		schema.restrictions.foreignKey.forEach((foreignKey) => {
			const fkIndex = fkRestrictions.length;
			const mappings: { localField: string; foreignField: string }[] = [];
			const edgeIds: string[] = [];
			const fieldKeys: string[] = [];
			const localFieldKeys: string[] = [];
			const foreignFieldKeys: string[] = [];

			foreignKey.mappings.forEach((mapping) => {
				const edgeId = `${schema.name}-${mapping.local}-to-${foreignKey.schema}-${mapping.foreign}`;
				mappings.push({ localField: mapping.local, foreignField: mapping.foreign });
				edgeIds.push(edgeId);

				const localKey = `${schema.name}::${mapping.local}`;
				const foreignKey_ = `${foreignKey.schema}::${mapping.foreign}`;
				fieldKeys.push(localKey, foreignKey_);
				localFieldKeys.push(localKey);
				foreignFieldKeys.push(foreignKey_);
				addToList(fieldKeyToFkIndices, localKey, fkIndex);
				addToList(fieldKeyToFkIndices, foreignKey_, fkIndex);
				addToList(localFieldKeyToFkIndices, localKey, fkIndex);
				addToList(foreignFieldKeyToFkIndices, foreignKey_, fkIndex);
			});

			fkRestrictions.push({
				localSchema: schema.name,
				foreignSchema: foreignKey.schema,
				mappings,
				edgeIds,
				fieldKeys,
				localFieldKeys,
				foreignFieldKeys,
			});
		});
	});

	return { fkRestrictions, localFieldKeyToFkIndices, foreignFieldKeyToFkIndices, fieldKeyToFkIndices };
}

/**
 * Traces the full FK chain from a starting edge, following parent links upward
 * and child links downward to collect all connected edges and field keys.
 *
 * @param {number} chainStartingIndex — The index into fkRestrictions for the FK that initiates the chain traversal
 * @param {RelationshipMap} map — The FK adjacency graph
 * @returns {{ edgeIds: Set<string>, fieldKeys: Set<string>, schemaChain: string[] }} All edges, fields, and schema names in the chain
 */
export function traceChain(
	chainStartingIndex: number,
	map: RelationshipMap,
): { edgeIds: Set<string>; fieldKeys: Set<string>; schemaChain: string[] } {
	const edgeIds = new Set<string>();
	const fieldKeys = new Set<string>();
	const visitedFkIndices = new Set<number>();

	if (chainStartingIndex < 0 || chainStartingIndex >= map.fkRestrictions.length) {
		return { edgeIds, fieldKeys, schemaChain: [] };
	}

	// Visit FK: Marks an FK restriction as visited and collects its edge IDs and field keys into the outer accumulators
	const visitFk = (index: number) => {
		if (visitedFkIndices.has(index)) {
			return;
		}
		visitedFkIndices.add(index);
		const fk = map.fkRestrictions[index];
		fk.edgeIds.forEach((id) => edgeIds.add(id));
		fk.fieldKeys.forEach((key) => fieldKeys.add(key));
	};

	visitFk(chainStartingIndex);

	const chainStartingFk = map.fkRestrictions[chainStartingIndex];

	// Trace UP: from foreign field keys, find FK restrictions where that field is the local side (parent's own FKs)
	const traceUp = (fk: FkRestrictionInfo) => {
		for (const foreignFieldKey of fk.foreignFieldKeys) {
			const indices = map.localFieldKeyToFkIndices.get(foreignFieldKey);
			if (!indices) {
				continue;
			}
			for (const idx of indices) {
				if (!visitedFkIndices.has(idx)) {
					visitFk(idx);
					traceUp(map.fkRestrictions[idx]);
				}
			}
		}
	};

	// Trace DOWN: from local field keys, find FK restrictions where that field is the foreign side (children pointing here)
	const traceDown = (fk: FkRestrictionInfo) => {
		for (const localFieldKey of fk.localFieldKeys) {
			const indices = map.foreignFieldKeyToFkIndices.get(localFieldKey);
			if (!indices) {
				continue;
			}
			for (const idx of indices) {
				if (!visitedFkIndices.has(idx)) {
					visitFk(idx);
					traceDown(map.fkRestrictions[idx]);
				}
			}
		}
	};

	traceUp(chainStartingFk);
	traceDown(chainStartingFk);

	const schemaNames = new Set<string>();
	for (const idx of visitedFkIndices) {
		const fk = map.fkRestrictions[idx];
		schemaNames.add(fk.localSchema);
		schemaNames.add(fk.foreignSchema);
	}

	return { edgeIds, fieldKeys, schemaChain: Array.from(schemaNames) };
}

/**
 * Returns a new edges array with className set based on the active edge set.
 * Active edges get 'edge-active', non-active edges get 'edge-inactive',
 * and when no relationship is active all edges have no className.
 */
export function getEdgesWithHighlight(edges: Edge[], activeEdgeIds?: Set<string>, activeColor?: string): Edge[] {
	if (!activeEdgeIds) {
		return edges.map((edge) => ({
			...edge,
			className: undefined,
			markerStart: ONE_CARDINALITY_MARKER_ID,
			markerEnd: { type: MarkerType.Arrow, width: 20, height: 20, color: '#374151' },
		}));
	}

	return edges.map((edge) => {
		const isActive = activeEdgeIds.has(edge.id);
		return {
			...edge,
			className: isActive ? 'edge-active' : 'edge-inactive',
			markerStart: isActive ? ONE_CARDINALITY_MARKER_ACTIVE_ID : ONE_CARDINALITY_MARKER_ID,
			markerEnd: {
				type: MarkerType.Arrow,
				width: 20,
				height: 20,
				color: isActive && activeColor ? activeColor : '#374151',
			},
		};
	});
}

/**
 * Derives ReactFlow edges from the relationship map, attaching fkIndex to each edge's data
 *
 * @param {RelationshipMap} map — The FK adjacency graph built by buildRelationshipMap
 * @returns {Edge[]} Array of ReactFlow edges representing foreign key relationships
 */
export function getEdgesFromMap(map: RelationshipMap): Edge[] {
	return map.fkRestrictions.flatMap((fk, fkIndex) =>
		fk.mappings.map((mapping, i) => ({
			id: fk.edgeIds[i],
			source: fk.foreignSchema,
			sourceHandle: createFieldHandleId(fk.foreignSchema, mapping.foreignField, 'source'),
			target: fk.localSchema,
			targetHandle: createFieldHandleId(fk.localSchema, mapping.localField, 'target'),
			type: 'smoothstep',
			pathOptions: { offset: -20 },
			data: { fkIndex } satisfies RelationshipEdgeData,
			markerEnd: { type: MarkerType.Arrow, width: 20, height: 20, color: '#374151' },
			markerStart: ONE_CARDINALITY_MARKER_ID,
		})),
	);
}
