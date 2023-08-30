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

import { expect } from 'chai';
import { DiffUtils } from '../src';
import DIFF_DICTIONARY_INITIAL from './fixtures/diff/initial';
import DIFF_DICTIONARY_UPDATED from './fixtures/diff/updated';

describe('Compute diff report between dictionary versions', () => {
	it('Should compute the diff, with one file added (3 fields), and 3 updated on existing file', () => {
		const diffReport = DiffUtils.getDiff(DIFF_DICTIONARY_INITIAL, DIFF_DICTIONARY_UPDATED);
		expect(diffReport).is.not.undefined;
		expect(diffReport.get('donor.donor_submitter_id')).to.not.be.undefined;
		expect(diffReport.get('donor.donor_submitter_id')?.diff).to.deep.eq({
			meta: { displayName: { type: 'deleted', data: 'Submitter Donor ID' } },
			restrictions: {
				script: {
					type: 'updated',
					data: { added: ['(field)=>field.length > 6'], deleted: ['(field)=>field.length > 5'] },
				},
			},
		});

		expect(diffReport.get('donor.gender')?.diff).to.deep.eq({
			restrictions: {
				codeList: {
					type: 'updated',
					data: {
						added: ['Undeclared'],
						deleted: ['Other'],
					},
				},
			},
		});

		expect(diffReport.get('donor.vital_status')?.diff).to.deep.eq({
			meta: {
				displayName: {
					type: 'updated',
					data: 'Donor Vital Status',
				},
			},
			restrictions: {
				codeList: {
					type: 'deleted',
					data: ['Alive', 'Deceased', 'Other'],
				},
			},
		});

		expect(diffReport.size).to.be.equal(8);
	});
});
