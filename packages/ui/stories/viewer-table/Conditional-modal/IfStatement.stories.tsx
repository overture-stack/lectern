/* Copyright (c) 2025 The Ontario Institute for Cancer Research. All rights reserved
 *
 * This program and the accompanying materials are made available under the terms of
 * the GNU Affero General Public License v3.0. You should have received a copy of the
 * GNU Affero General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 * SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/** @jsxImportSource @emotion/react */

import type { Meta, StoryObj } from '@storybook/react';

import { IfStatement } from '../../../src/viewer-table/ConditionalLogicModal/IfStatement';

import themeDecorator from '../../themeDecorator';

const meta = {
	component: IfStatement,
	title: 'Viewer Table/Conditional Modal/If Statement',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof IfStatement>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleFieldValueAll: Story = {
	args: {
		conditionalRestriction: {
			conditions: [
				{
					fields: ['status'],
					match: { value: 'active' },
					case: 'all',
				},
			],
			case: 'all',
		},
	},
};

export const SingleFieldValueAny: Story = {
	args: {
		conditionalRestriction: {
			conditions: [
				{
					fields: ['status'],
					match: { value: 'active' },
					case: 'any',
				},
			],
			case: 'all',
		},
	},
};

export const SingleFieldValueNone: Story = {
	args: {
		conditionalRestriction: {
			conditions: [
				{
					fields: ['status'],
					match: { value: 'disabled' },
					case: 'none',
				},
			],
			case: 'all',
		},
	},
};

export const MultipleFieldsValueAll: Story = {
	args: {
		conditionalRestriction: {
			conditions: [
				{
					fields: ['field_a', 'field_b', 'field_c'],
					match: { value: 'test' },
					case: 'all',
				},
			],
			case: 'all',
		},
	},
};

export const CodeListMatch: Story = {
	args: {
		conditionalRestriction: {
			conditions: [
				{
					fields: ['type'],
					match: { codeList: ['premium', 'standard', 'basic'] },
					case: 'all',
				},
			],
			case: 'all',
		},
	},
};

export const RegexMatch: Story = {
	args: {
		conditionalRestriction: {
			conditions: [
				{
					fields: ['identifier'],
					match: { regex: '^NCIT:C\\d+$' },
					case: 'all',
				},
			],
			case: 'all',
		},
	},
};

export const RangeMatchMinMax: Story = {
	args: {
		conditionalRestriction: {
			conditions: [
				{
					fields: ['age'],
					match: { range: { min: 18, max: 65 } },
					case: 'all',
				},
			],
			case: 'all',
		},
	},
};

export const ExistsTrue: Story = {
	args: {
		conditionalRestriction: {
			conditions: [
				{
					fields: ['optional_field'],
					match: { exists: true },
					case: 'all',
				},
			],
			case: 'all',
		},
	},
};

export const CountExact: Story = {
	args: {
		conditionalRestriction: {
			conditions: [
				{
					fields: ['tags'],
					match: { count: 3 },
					case: 'all',
				},
			],
			case: 'all',
		},
	},
};

export const CountRange: Story = {
	args: {
		conditionalRestriction: {
			conditions: [
				{
					fields: ['categories'],
					match: { count: { min: 1, max: 5 } },
					case: 'all',
				},
			],
			case: 'all',
		},
	},
};

export const CodeListWithCountRestrictions: Story = {
	args: {
		conditionalRestriction: {
			conditions: [
				{
					fields: ['items'],
					match: { count: { max: 10 }, codeList: ['hello world', 'bye world'] },
					case: 'all',
				},
			],
			case: 'all',
		},
	},
};

export const MultipleConditionsAll: Story = {
	args: {
		conditionalRestriction: {
			conditions: [
				{
					fields: ['status'],
					match: { value: 'active' },
					case: 'all',
				},
				{
					fields: ['age'],
					match: { range: { min: 18 } },
					case: 'all',
				},
			],
			case: 'all',
		},
	},
};

export const MultipleConditionsAny: Story = {
	args: {
		conditionalRestriction: {
			conditions: [
				{
					fields: ['status'],
					match: { value: 'premium' },
					case: 'all',
				},
				{
					fields: ['score'],
					match: { range: { min: 80 } },
					case: 'all',
				},
			],
			case: 'any',
		},
	},
};

export const AllMatchTypes: Story = {
	args: {
		conditionalRestriction: {
			conditions: [
				{
					fields: ['status'],
					match: { value: 'active' },
					case: 'all',
				},
				{
					fields: ['type'],
					match: { codeList: ['premium', 'standard'] },
					case: 'all',
				},
				{
					fields: ['identifier'],
					match: { regex: '^NCIT:C\\d+$' },
					case: 'all',
				},
				{
					fields: ['age'],
					match: { range: { min: 18, max: 65 } },
					case: 'all',
				},
				{
					fields: ['optional_field'],
					match: { exists: true },
					case: 'all',
				},
				{
					fields: ['tags'],
					match: { count: { min: 1, max: 5 } },
					case: 'all',
				},
			],
			case: 'all',
		},
	},
};
