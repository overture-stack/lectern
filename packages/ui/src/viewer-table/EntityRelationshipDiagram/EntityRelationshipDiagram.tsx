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

/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { type Theme, useThemeContext } from '../../theme';
import type { Dictionary } from '@overture-stack/lectern-dictionary';
import { useCallback, useMemo } from 'react';
import ReactFlow, {
	Background,
	BackgroundVariant,
	Controls,
	useEdgesState,
	useNodesState,
	type Edge,
	type NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import OneCardinalityMarker from '../../theme/icons/OneCardinalityMarker';
import { getEdgesFromMap, getEdgesWithHighlight, getLayoutedDiagram, type RelationshipEdgeData } from './diagramUtils';
import { useActiveRelationship } from './ActiveRelationshipContext';
import { SchemaNode } from './SchemaNode';

const nodeTypes: NodeTypes = {
	schema: SchemaNode,
};

type EntityRelationshipDiagramProps = {
	dictionary: Dictionary;
};

const edgeHoverStyles = (theme: Theme) => css`
	.react-flow__edge {
		cursor: pointer;
	}
	.react-flow__edge-path {
		stroke: ${theme.colors.black};
		stroke-width: 2;
	}
	.react-flow__edge:hover .react-flow__edge-path {
		stroke: ${theme.colors.secondary_dark};
	}

	.react-flow__edge.edge-active .react-flow__edge-path {
		stroke: ${theme.colors.secondary_dark};
		stroke-width: 3;
	}

	.react-flow__edge.edge-inactive .react-flow__edge-path {
		stroke: ${theme.colors.grey_5};
		stroke-width: 1.5;
		opacity: 0.9;
	}

	.react-flow__edge.edge-inactive .react-flow__edge-path:hover {
		stroke: ${theme.colors.grey_4};
	}
`;

/**
 * Entity Relationship Diagram visualizing schemas and their foreign key relationships.
 * Must be rendered inside an `ActiveRelationshipProvider`.
 * Uses d3-dag's Sugiyama algorithm to compute a hierarchical layout from FK relationships.
 */
export function EntityRelationshipDiagramContent({ dictionary }: EntityRelationshipDiagramProps) {
	const { activeEdgeIds, activateRelationship, deactivateRelationship, relationshipMap } = useActiveRelationship();
	const allEdges = getEdgesFromMap(relationshipMap);
	const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedDiagram(dictionary, allEdges);
	const [nodes, , onNodesChange] = useNodesState(layoutedNodes);
	const [edges, , onEdgesChange] = useEdgesState(layoutedEdges);
	const theme = useThemeContext();

	const highlightedEdges = useMemo(
		() => getEdgesWithHighlight(edges, activeEdgeIds, theme.colors.secondary_dark),
		[edges, activeEdgeIds],
	);

	const onEdgeClick = useCallback(
		(_event: React.MouseEvent, edge: Edge) => {
			const edgeData = edge.data as RelationshipEdgeData | undefined;
			if (edgeData?.fkIndex !== undefined) {
				activateRelationship(edgeData.fkIndex);
			}
		},
		[activateRelationship],
	);

	const onPaneClick = useCallback(() => {
		deactivateRelationship();
	}, [deactivateRelationship]);

	return (
		<>
			<OneCardinalityMarker activeColor={theme.colors.secondary_dark} />
			<div css={edgeHoverStyles(theme)} style={{ width: '100%', height: '100%' }}>
				<ReactFlow
					nodes={nodes}
					edges={highlightedEdges}
					onNodesChange={onNodesChange}
					onEdgesChange={onEdgesChange}
					onEdgeClick={onEdgeClick}
					onPaneClick={onPaneClick}
					nodeTypes={nodeTypes}
					fitView
					fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
					style={{ width: '100%', height: '100%' }}
					defaultViewport={{ x: 0, y: 0, zoom: 1.0 }}
					minZoom={0.05}
					maxZoom={3}
				>
					<Controls />
					<Background variant={BackgroundVariant.Lines} />
				</ReactFlow>
			</div>
		</>
	);
}
