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

import type { ArrayTestCase, RestrictionCondition } from '@overture-stack/lectern-dictionary';
import type { Meta, StoryObj } from '@storybook/react';
import { ConditionalRestrictionDetails } from '../../../src/viewer-table/ConditionalLogicModal/ConditionalRestrictionDetails';
import themeDecorator from '../../themeDecorator';

type RenderingConditionLogicContainerProps = {
	conditions: RestrictionCondition[];
	matchCase: ArrayTestCase;
};

const RenderingConditionLogicContainer = ({ conditions, matchCase }: RenderingConditionLogicContainerProps) => {
	return <div style={{ padding: '16px' }}>{ConditionalRestrictionDetails(conditions, matchCase)}</div>;
};

const meta = {
	component: RenderingConditionLogicContainer,
	title: 'Viewer - Table/Conditional Modal/Rendering Condition Logic',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof RenderingConditionLogicContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleFieldValueAll: Story = {
	args: {
		conditions: [
			{
				fields: ['status'],
				match: { value: 'active' },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const SingleFieldValueAny: Story = {
	args: {
		conditions: [
			{
				fields: ['status'],
				match: { value: 'active' },
				case: 'any',
			},
		],
		matchCase: 'all',
	},
};

export const SingleFieldValueNone: Story = {
	args: {
		conditions: [
			{
				fields: ['status'],
				match: { value: 'disabled' },
				case: 'none',
			},
		],
		matchCase: 'all',
	},
};

export const MultipleFieldsValueAll: Story = {
	args: {
		conditions: [
			{
				fields: ['field_a', 'field_b', 'field_c'],
				match: { value: 'test' },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const MultipleFieldsValueAny: Story = {
	args: {
		conditions: [
			{
				fields: ['field_a', 'field_b'],
				match: { value: 'test' },
				case: 'any',
			},
		],
		matchCase: 'all',
	},
};

export const MultipleFieldsValueNone: Story = {
	args: {
		conditions: [
			{
				fields: ['field_a', 'field_b'],
				match: { value: 'test' },
				case: 'none',
			},
		],
		matchCase: 'all',
	},
};

export const CodeListMatch: Story = {
	args: {
		conditions: [
			{
				fields: ['type'],
				match: { codeList: ['premium', 'standard', 'basic'] },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const RegexMatch: Story = {
	args: {
		conditions: [
			{
				fields: ['identifier'],
				match: { regex: '^NCIT:C\\d+$' },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const RegexArrayMatch: Story = {
	args: {
		conditions: [
			{
				fields: ['code'],
				match: { regex: ['^A\\d+$', '^B\\d+$'] },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const RangeMatchMinMax: Story = {
	args: {
		conditions: [
			{
				fields: ['age'],
				match: { range: { min: 18, max: 65 } },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const RangeMatchExclusiveMax: Story = {
	args: {
		conditions: [
			{
				fields: ['score'],
				match: { range: { min: 0, exclusiveMax: 100 } },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const RangeMatchExclusiveMin: Story = {
	args: {
		conditions: [
			{
				fields: ['score'],
				match: { range: { exclusiveMin: 0, max: 100 } },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const ExistsTrue: Story = {
	args: {
		conditions: [
			{
				fields: ['optional_field'],
				match: { exists: true },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const ExistsFalse: Story = {
	args: {
		conditions: [
			{
				fields: ['optional_field'],
				match: { exists: false },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const CountExact: Story = {
	args: {
		conditions: [
			{
				fields: ['tags'],
				match: { count: 3 },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const CountRange: Story = {
	args: {
		conditions: [
			{
				fields: ['categories'],
				match: { count: { min: 1, max: 5 } },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const CountExclusiveMin: Story = {
	args: {
		conditions: [
			{
				fields: ['items'],
				match: { count: { exclusiveMin: 0 } },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const CodeListWithCountRestrictions: Story = {
	args: {
		conditions: [
			{
				fields: ['items'],
				match: { count: { max: 10 }, codeList: ['hello world', 'bye world'] },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const CodeListWithCountExact: Story = {
	args: {
		conditions: [
			{
				fields: ['colors'],
				match: { codeList: ['Red', 'Blue', 'Green'], count: 2 },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const CodeListWithCountMinMax: Story = {
	args: {
		conditions: [
			{
				fields: ['options'],
				match: { codeList: ['A', 'B', 'C', 'D'], count: { min: 2, max: 4 } },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const CodeListWithCountMinExclusiveMax: Story = {
	args: {
		conditions: [
			{
				fields: ['selections'],
				match: { codeList: ['Option1', 'Option2', 'Option3'], count: { min: 1, exclusiveMax: 3 } },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const CodeListWithCountExclusiveMinMax: Story = {
	args: {
		conditions: [
			{
				fields: ['choices'],
				match: { codeList: ['X', 'Y', 'Z'], count: { exclusiveMin: 0, max: 2 } },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const CodeListWithCountExclusiveMinExclusiveMax: Story = {
	args: {
		conditions: [
			{
				fields: ['items'],
				match: { codeList: ['Alpha', 'Beta', 'Gamma'], count: { exclusiveMin: 1, exclusiveMax: 4 } },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const CodeListWithCountMinOnly: Story = {
	args: {
		conditions: [
			{
				fields: ['tags'],
				match: { codeList: ['tag1', 'tag2', 'tag3', 'tag4'], count: { min: 2 } },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const CodeListWithCountMaxOnly: Story = {
	args: {
		conditions: [
			{
				fields: ['categories'],
				match: { codeList: ['cat1', 'cat2', 'cat3'], count: { max: 2 } },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const CodeListWithCountExclusiveMinOnly: Story = {
	args: {
		conditions: [
			{
				fields: ['elements'],
				match: { codeList: ['elem1', 'elem2', 'elem3'], count: { exclusiveMin: 0 } },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const CodeListWithCountExclusiveMaxOnly: Story = {
	args: {
		conditions: [
			{
				fields: ['values'],
				match: { codeList: ['val1', 'val2', 'val3', 'val4'], count: { exclusiveMax: 3 } },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const MultipleConditionsAll: Story = {
	args: {
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
		matchCase: 'all',
	},
};

export const MultipleConditionsAny: Story = {
	args: {
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
		matchCase: 'any',
	},
};

export const MultipleConditionsNone: Story = {
	args: {
		conditions: [
			{
				fields: ['status'],
				match: { value: 'disabled' },
				case: 'all',
			},
			{
				fields: ['expired'],
				match: { exists: true },
				case: 'all',
			},
		],
		matchCase: 'none',
	},
};

export const AllMatchTypes: Story = {
	args: {
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
		matchCase: 'all',
	},
};

export const AllMatchTypesWithCodeListCount: Story = {
	args: {
		conditions: [
			{
				fields: ['status'],
				match: { value: 'active' },
				case: 'all',
			},
			{
				fields: ['categories'],
				match: { codeList: ['premium', 'standard', 'basic'], count: { min: 1, max: 2 } },
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
				fields: ['colors'],
				match: { codeList: ['Red', 'Blue', 'Green', 'Yellow'], count: 3 },
				case: 'any',
			},
			{
				fields: ['permissions'],
				match: { codeList: ['read', 'write', 'admin'], count: { exclusiveMin: 0, exclusiveMax: 3 } },
				case: 'none',
			},
		],
		matchCase: 'all',
	},
};
