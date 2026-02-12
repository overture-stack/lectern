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

import type { Meta, StoryObj } from '@storybook/react';
import type { Dictionary } from '@overture-stack/lectern-dictionary';

import { EntityRelationshipDiagram } from '../../src/viewer-table/EntityRelationshipDiagram';
import DictionarySample from '../fixtures/pcgl.json';
import SimpleERDiagram from '../fixtures/simpleERDiagram.json';
import themeDecorator from '../themeDecorator';
import React from 'react';

const meta = {
	component: EntityRelationshipDiagram,
	title: 'Viewer - Table/Entity Relationship Diagram',
	decorators: [themeDecorator()],
	parameters: {
		layout: 'fullscreen',
	},
} satisfies Meta<typeof EntityRelationshipDiagram>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		dictionary: DictionarySample as Dictionary,
	},
	render: (args) => (
		<div style={{ width: '100%', height: '100vh' }}>
			<EntityRelationshipDiagram {...args} />
		</div>
	),
};