/** @jsxImportSource @emotion/react */
import type { Dictionary } from '@overture-stack/lectern-dictionary';
import { useMemo } from 'react';
import ReactFlow, {
	Background,
	BackgroundVariant,
	Controls,
	Edge,
	MarkerType,
	useEdgesState,
	useNodesState,
	type NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { EntitiesDiagramSchemaNode } from './EntitiesDiagramSchemaNode';
import { getNodesForDictionary, type SchemaNodeLayout } from './SchemaFlowNode';
import { css } from '@emotion/react';

// TODO: Colors and styling constants taken from theme instead of hardcoded

// Register our custom node type
const nodeTypes: NodeTypes = {
	schema: EntitiesDiagramSchemaNode,
};

function getEdgesForDictionary(dictionary: Dictionary): Edge[] {
	return dictionary.schemas
		.flatMap<Edge | undefined>((schema) => {
			if (schema.restrictions?.foreignKey) {
				return schema.restrictions.foreignKey.map((foreignKey) => {
					const id = `${schema.name}-${foreignKey.schema}`;
					const label = foreignKey.mappings.map((mapping) => `${mapping.local} → ${mapping.foreign}`).join(', ');

					return {
						id,
						label,
						source: foreignKey.schema,
						target: schema.name,
						sourceHandle: 'source-right',
						targetHandle: 'target-left',
						type: 'smoothstep',
						style: { stroke: '#374151', strokeWidth: 2 },
						labelStyle: {
							fontSize: 11,
							fontWeight: 'bold',
							fill: '#374151',
							backgroundColor: '#ffffff',
						},
						labelBgStyle: {
							fill: '#ffffff',
							fillOpacity: 0.95,
							stroke: '#e5e7eb',
							strokeWidth: 1,
						},
						markerEnd: {
							type: MarkerType.ArrowClosed,
							width: 20,
							height: 20,
							color: '#374151',
						},
					};
				});
			}
			return undefined;
		})
		.filter((maybeEdge) => maybeEdge !== undefined);
}

export function EntitiesDiagram(props: { dictionary: Dictionary; layout?: Partial<SchemaNodeLayout> }) {
	// const nodes = useMemo(() => getNodesForDictionary(props.dictionary), [props.dictionary]);
	// const edges = getEdgesForDictionary(props.dictionary);

	const [nodes, setNodes, onNodesChange] = useNodesState(getNodesForDictionary(props.dictionary, props.layout));
	const [edges, setEdges, onEdgesChange] = useEdgesState(getEdgesForDictionary(props.dictionary));
	return (
		<ReactFlow
			nodes={nodes}
			edges={edges}
			onNodesChange={onNodesChange}
			onEdgesChange={onEdgesChange}
			nodeTypes={nodeTypes}
			fitView
			fitViewOptions={{ padding: 20, maxZoom: 1.5, minZoom: 0.5 }}
			style={{ width: '100%', height: '100%' }}
			defaultViewport={{ x: 0, y: 0, zoom: 1.0 }}
			minZoom={0.1}
			maxZoom={3}
		>
			<Controls />
			<Background variant={BackgroundVariant.Dots} />
		</ReactFlow>
	);
}
