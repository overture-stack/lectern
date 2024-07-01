// /*
//  * Copyright (c) 2024 The Ontario Institute for Cancer Research. All rights reserved
//  *
//  * This program and the accompanying materials are made available under the terms of
//  * the GNU Affero General Public License v3.0. You should have received a copy of the
//  * GNU Affero General Public License along with this program.
//  *  If not, see <http://www.gnu.org/licenses/>.
//  *
//  * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
//  * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
//  * SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
//  * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
//  * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
//  * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
//  * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//  */

// import type { DataRecord, Schema } from 'dictionary';
// import { validateField } from './validateField';

// export const validateRecord = (record: DataRecord, schema: Schema): TestResult<RecordValidationError[]> => {
// 	// We first check if the data record has any fields that are not in our schema definition
// 	const unrecognizedFieldErrors = Object.entries(record).reduce<FieldValidationErrorUnrecognized[]>(
// 		(output, [fieldName, value]) => {
// 			if (!schema.fields.some((field) => field.name === fieldName)) {
// 				output.push({
// 					result: 'UNRECOGNIZED_FIELD',
// 					fieldName,
// 					value,
// 				});
// 			}
// 			return output;
// 		},
// 		[],
// 	);

// 	// Now we can apply the validation rules for each field in the schema.
// 	// If a field is missing in the record then the value will be `undefined`. This will fail a Required restriction but pass all others.
// 	const fieldValidationErrors = schema.fields.reduce<FieldValidationErrorRestrictions[]>((output, field) => {
// 		const fieldName = field.name;
// 		const value = record[fieldName];
// 		const fieldValidationResult = validateField(value, record, field);
// 		if (!fieldValidationResult.valid) {
// 			output.push({ result: 'INVALID', fieldName, value, errors });
// 		}
// 		return output;
// 	}, []);

// 	return [...unrecognizedFieldErrors, ...fieldValidationErrors];
// };

// // Next to write:
// // validateSchema (list of records within one schema, adds in schema validations such as unique and uniqueKey
// // validateDataSet (dictionary of many schemas worth of data, adds in validation of foreign keys and unknown entity names)