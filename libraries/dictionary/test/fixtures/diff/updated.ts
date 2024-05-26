/*
 * Copyright (c) 2023 The Ontario Institute for Cancer Research. All rights reserved
 *
 * This program and the accompanying materials are made available under the terms of
 * the GNU Affero General Public License v3.0. You should have received a copy of the
 * GNU Affero General Public License along with this program.
 *  If not, see <http://www.gnu.org/licenses/>.
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

import { Dictionary } from '../../../src';

const DIFF_DICTIONARY_UPDATED: Dictionary = {
	name: 'Test Dictionary For Diffs',
	version: '1.3',
	schemas: [
		{
			name: 'donor',
			description: 'Donor Entity',
			fields: [
				{
					name: 'donor_submitter_id',
					valueType: 'string',
					description: 'Unique identifier for donor; assigned by data provider',
					meta: {
						key: true,
					},
				},
				{
					name: 'gender',
					valueType: 'string',
					description: 'Donor Biological Sex',
					restrictions: {
						codeList: ['Male', 'Female', 'Undeclared'],
					},
				},
				{
					name: 'ethnicity',
					valueType: 'string',
					description: 'Self described',
					meta: {
						default: 'Foo',
					},
					restrictions: {},
				},
				{
					name: 'vital_status',
					valueType: 'string',
					description: "Donor's last known vital status",
					meta: {
						displayName: 'Donor Vital Status',
						default: 'Other',
					},
					restrictions: {},
				},
			],
		},
		{
			name: 'added_field',
			description: 'This field was added for the test',
			fields: [
				{
					name: 'testNewFile1',
					valueType: 'string',
					description: 'Unique identifier for donor; assigned by data provider',
				},
				{
					name: 'testNewFile2',
					valueType: 'string',
					description: 'Unique identifier for donor; assigned by data provider',
				},
				{
					name: 'testNewFile3',
					valueType: 'string',
					description: 'Unique identifier for donor; assigned by data provider',
				},
			],
		},
	],
};
export default DIFF_DICTIONARY_UPDATED;
