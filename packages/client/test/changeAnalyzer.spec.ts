/*
 * Copyright (c) 2024 The Ontario Institute for Cancer Research. All rights reserved
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

import { DiffUtils } from '@overture-stack/lectern-dictionary';
import chai from 'chai';
import { analyzeChanges, ChangeAnalysis } from '../src/changeAnalysis';
import diffResponse from './fixtures/diffResponse';
chai.should();

const diffFixture = DiffUtils.diffArrayToMap(diffResponse);

const expectedResult: ChangeAnalysis = {
	fields: {
		addedFields: [],
		renamedFields: [],
		deletedFields: ['primary_diagnosis.menopause_status'],
	},
	restrictionsChanges: {
		codeList: {
			created: [],
			deleted: [
				{
					field: 'donor.vital_status',
					definition: ['Alive', 'Deceased', 'Not reported', 'Unknown'],
				},
			],
			updated: [
				{
					field: 'donor.cause_of_death',
					definition: {
						added: ['N/A'],
						deleted: ['Died of cancer', 'Unknown'],
					},
				},
			],
		},
		regex: {
			updated: [
				{
					field: 'donor.submitter_donor_id',
					definition: '[A-Za-z0-9\\-\\._]{3,64}',
				},
				{
					field: 'primary_diagnosis.cancer_type_code',
					definition: '[A-Z]{1}[0-9]{2}.[0-9]{0,3}[A-Z]{2,3}$',
				},
			],
			created: [
				{
					field: 'donor.vital_status',
					definition: '[A-Z]{3,100}',
				},
			],
			deleted: [],
		},
		required: {
			updated: [],
			created: [],
			deleted: [],
		},
		range: {
			updated: [
				{
					definition: {
						max: 1,
					},
					field: 'specimen.percent_stromal_cells',
				},
			],
			created: [
				{
					field: 'donor.survival_time',
					definition: {
						min: 0,
						max: 200000,
					},
				},
			],
			deleted: [],
		},
		script: {
			created: [],
			deleted: [],
			updated: [],
		},
	},
	isArrayDesignationChanges: ['primary_diagnosis.presenting_symptoms'],
	valueTypeChanges: ['sample_registration.program_id'],
};

describe('changeAnalyzer', () => {
	it('categorize changes correctly', () => {
		const result = analyzeChanges(diffFixture);
		result.should.deep.eq(expectedResult);
	});
});
