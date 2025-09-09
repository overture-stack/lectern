/*
 * Copyright (c) 2025 The Ontario Institute for Cancer Research. All rights reserved
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
import { createDataFileTemplate, Schema } from '@overture-stack/lectern-dictionary';

describe('createDataFileTemplate', () => {
	const sampleSchema: Schema = {
		name: 'patient_data',
		fields: [
			{ name: 'id', valueType: 'string' },
			{ name: 'name', valueType: 'string' },
			{ name: 'age', valueType: 'number' },
		],
	};

	it('adds every header from the schema', () => {
		const result = createDataFileTemplate(sampleSchema);
		const [headerLine] = result.content.trim().split('\n');
		const headers = headerLine.split('\t');
		expect(headers).to.deep.equal(['id', 'name', 'age']);
	});

	it('adds headers in the order defined in the schema', () => {
		const schema: Schema = {
			name: 'ordered_test',
			fields: [
				{ name: 'z_field', valueType: 'string' },
				{ name: 'a_field', valueType: 'string' },
				{ name: 'm_field', valueType: 'string' },
			],
		};
		const result = createDataFileTemplate(schema);
		const [headerLine] = result.content.trim().split('\n');
		expect(headerLine).to.equal('z_field\ta_field\tm_field');
	});

	it('creates an empty data row with correct number of placeholders', () => {
		const result = createDataFileTemplate(sampleSchema);
		const lines = result.content.trim().split('\n');
		expect(lines.length).to.equal(2);
		const emptyRow = lines[1];
		expect(emptyRow).to.equal('\t\t');
	});

	it('uses correct delimiter for fileType: tsv', () => {
		const result = createDataFileTemplate(sampleSchema, { fileType: 'tsv' });
		expect(result.content).to.include('\t');
		expect(result.fileName).to.equal('patient_data.tsv');
	});

	it('uses correct delimiter for fileType: csv', () => {
		const result = createDataFileTemplate(sampleSchema, { fileType: 'csv' });
		expect(result.content).to.include(',');
		expect(result.fileName).to.equal('patient_data.csv');
	});

	it('uses custom delimiter and extension', () => {
		const result = createDataFileTemplate(sampleSchema, {
			delimiter: '|',
			extension: 'pipe',
		});
		const [headerLine, dataLine] = result.content.trim().split('\n');
		expect(headerLine).to.equal('id|name|age');
		expect(dataLine).to.equal('||');
		expect(result.fileName).to.equal('patient_data.pipe');
	});

	it('matches the template filename to the schema name and extension', () => {
		const schema: Schema = {
			name: 'custom_name',
			fields: [{ name: 'x', valueType: 'boolean' }],
		};
		const result = createDataFileTemplate(schema, { fileType: 'csv' });
		expect(result.fileName).to.equal('custom_name.csv');
	});

	it('defaults to tsv if no options are provided', () => {
		const result = createDataFileTemplate(sampleSchema);
		expect(result.fileName).to.equal('patient_data.tsv');
		expect(result.content).to.include('\t');
	});
});
