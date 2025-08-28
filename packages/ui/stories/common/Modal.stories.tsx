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

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import Button from '../../src/common/Button';
import ModalComponent from '../../src/common/Modal';

import themeDecorator from '../themeDecorator';

const meta = {
	component: ModalComponent,
	title: 'Common/Modal',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
	parameters: {
		docs: {
			description: {
				component:
					'A reusable modal component built on react-modal that provides consistent styling and behavior for overlays and dialogs.',
			},
		},
	},
} satisfies Meta<typeof ModalComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		isOpen: false,
		setIsOpen: () => {},
		title: 'Modal Title',
	},
	render: (args) => {
		const [isOpen, setIsOpen] = useState(false);

		return (
			<>
				<Button onClick={() => setIsOpen(true)}>Open Modal</Button>
				<ModalComponent {...args} isOpen={isOpen} setIsOpen={setIsOpen}>
					<p>This is the body of the modal.</p>
				</ModalComponent>
			</>
		);
	},
};
