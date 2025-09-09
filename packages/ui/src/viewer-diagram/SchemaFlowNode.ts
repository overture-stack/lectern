import type { Dictionary, Schema, SchemaField } from '@overture-stack/lectern-dictionary';
import type { Node } from 'reactflow';

export type SchemaFlowNodeField = SchemaField & {
	isUniqueKey: boolean;
	isRequired: boolean;
	isForeignKey: boolean;
};

// export type SchemaFlowNode = Node<Omit<Schema, 'fields'> & { fields: SchemaFlowNodeField[] }, 'schema'>;
export type SchemaFlowNode = Node<Schema, 'schema'>;

export type SchemaNodeLayout = { maxColumns: number; columnWidth: number; rowHeight: number };

/**
 * Create a Node for ReactFlow to render from the data in a Schema.
 * This runs a calculation on each field to determine if it is a uniqueKey or foreignKey for the schema
 * @param schema
 * @returns
 */
export function buildSchemaNode(schema: Schema): Omit<SchemaFlowNode, 'position'> {
	return {
		id: schema.name,
		type: 'schema',
		data: { ...schema },
	};
}

/**
 * Given a dicitonary, generate an array of ReactFlow nodes from the schemas, including initial sizes and positions.
 *
 * Schemas are arranged in a grid, 4 wide.
 */
export function getNodesForDictionary(dictionary: Dictionary, layout?: Partial<SchemaNodeLayout>): Node[] {
	const maxColumns = layout?.maxColumns ?? 4;
	const columnWidth = layout?.columnWidth ?? 500;
	const rowWidth = layout?.rowHeight ?? 500;

	// Create nodes for each schema with left-to-right flow positioning
	return dictionary.schemas.map((schema, index) => {
		const partialNode = buildSchemaNode(schema);

		// Determine Position of this node (top left corner)
		const row = Math.floor(index / maxColumns);
		const col = index % maxColumns;

		// Calculate positions for left-to-right flow
		// TODO: calculate size based off node contents
		const position: Node['position'] = {
			x: col * columnWidth,
			y: row * rowWidth,
		};

		return { ...partialNode, position };
	});
}
