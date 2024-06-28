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

import { SchemaValidationErrorTypes } from '@overture-stack/lectern-validation';
import chai from 'chai';
import { functions as schemaService } from '../src';
import { loggerFor } from '../src/logger';
import dictionary from './fixtures/registrationSchema';
const L = loggerFor(__filename);

chai.should();

const VALUE_NOT_ALLOWED = 'The value is not permissible for this field.';
const PROGRAM_ID_REQ = 'program_id is a required field.';

describe('processing', () => {
	it('should populate records based on default value ', () => {
		const result = schemaService.processRecords(dictionary, 'registration', [
			{
				program_id: 'PEME-CA',
				submitter_donor_id: 'OD1234',
				gender: '',
				submitter_specimen_id: '87813',
				specimen_type: 'Skin',
				tumour_normal_designation: 'Normal',
				submitter_sample_id: 'MAS123',
				sample_type: 'ctDNA',
			},
			{
				program_id: 'PEME-CA',
				submitter_donor_id: 'OD1234',
				gender: '',
				submitter_specimen_id: '87812',
				specimen_type: 'Skin',
				tumour_normal_designation: 'Normal',
				submitter_sample_id: 'MAS1234',
				sample_type: 'ctDNA',
			},
		]);
		chai.expect(result.processedRecords[0]?.gender).to.eq('Other');
		chai.expect(result.processedRecords[1]?.gender).to.eq('Other');
	});

	it('should NOT populate missing columns based on default value ', () => {
		const result = schemaService.processRecords(dictionary, 'registration', [
			{
				program_id: 'PEME-CA',
				submitter_donor_id: 'OD1234',
				gendr: '',
				submitter_specimen_id: '87813',
				specimen_type: 'Skin',
				tumour_normal_designation: 'Normal',
				submitter_sample_id: 'MAS123',
				sample_type: 'ctDNA',
			},
			{
				program_id: 'PEME-CA',
				submitter_donor_id: 'OD1234',
				gender: '',
				submitter_specimen_id: '87812',
				specimen_type: 'Skin',
				tumour_normal_designation: 'Normal',
				submitter_sample_id: 'MAS1234',
				sample_type: 'ctDNA',
			},
		]);
		chai.expect(result.validationErrors).to.deep.include({
			errorType: SchemaValidationErrorTypes.MISSING_REQUIRED_FIELD,
			fieldName: 'gender',
			index: 0,
			info: {},
			message: 'gender is a required field.',
		});
	});
});
