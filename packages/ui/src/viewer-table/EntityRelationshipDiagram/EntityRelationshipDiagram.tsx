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
import type { Dictionary } from '@overture-stack/lectern-dictionary';
import ReactFlow, {
	Background,
	BackgroundVariant,
	Controls,
	useEdgesState,
	useNodesState,
	type NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import OneCardinalityMarker from '../../theme/icons/OneCardinalityMarker';
import { getEdgesForDictionary, getNodesForDictionary, type SchemaNodeLayout } from './diagramUtils';
import { SchemaNode } from './SchemaNode';

const nodeTypes: NodeTypes = {
	schema: SchemaNode,
};

type EntityRelationshipDiagramProps = {
	dictionary: Dictionary;
	layout?: Partial<SchemaNodeLayout>;
};

/**
 * Entity Relationship Diagram visualizing schemas and their foreign key relationships.
 *
 * @param {Dictionary} dictionary — The Lectern dictionary whose schemas and relationships to visualize
 * @param {Partial<SchemaNodeLayout>} layout — Optional overrides for the grid layout of schema nodes.
 *   maxColumns controls the number of nodes per row before wrapping (default 4),
 *   columnWidth sets horizontal spacing in pixels between column left edges (default 500),
 *   and rowHeight sets vertical spacing in pixels between row top edges (default 500)
 */
export function EntityRelationshipDiagram({ dictionary, layout }: EntityRelationshipDiagramProps) {
	const [nodes, , onNodesChange] = useNodesState(getNodesForDictionary(dictionary, layout));
	const [edges, , onEdgesChange] = useEdgesState(getEdgesForDictionary(dictionary));

	return (
		<>
			<OneCardinalityMarker />
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
				<Background variant={BackgroundVariant.Lines} />
			</ReactFlow>
		</>
	);
}
