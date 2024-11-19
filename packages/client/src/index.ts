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

// Exporting zod Schemas and types for the basic dictionary components and data types
export {
	DataRecord,
	DataRecordValue,
	UnprocessedDataRecord,
	ArrayDataValue,
	SingleDataValue,
	Dictionary,
	Schema,
	SchemaField,
	Result,
} from '@overture-stack/lectern-dictionary';
import * as _validation from '@overture-stack/lectern-validation';

// Exporting all result types used in the parsing and validation functions
export type {
	TestResult,
	TestResultValid,
	TestResultInvalid,
	SchemaValidationRecordErrorDetails,
	SchemaRecordError,
	DictionaryValidationRecordErrorDetails,
	DictionaryValidationError,
	FieldValidationErrorRestrictionInfo,
	FieldValidationError,
	ParseDictionaryData,
	ParseDictionaryFailure,
	ParseDictionaryResult,
	ParseFieldError,
	ParseSchemaError,
	ParseSchemaFailureData,
	ParseSchemaResult,
	ParseRecordFailureData,
	ParseRecordResult,
} from '@overture-stack/lectern-validation';

import * as _processing from './processing';
export * as rest from './rest';

/**
 * Processing functions will perform both data parsing and validation and then return an
 * object with the parsed data and a list of any errors encountered.
 *
 * The available processing functions are concerned with data at different scales:
 * - processRecord: will process a single data record using schema definition
 * - processSchema: will process a collection of data records using a single schema definition
 * - processDictionary: will process multiple collecitons of data records, each vs a different
 *     schema definition that is found in a dictionary definition.
 */
export const process = _processing;

/**
 * Validation functions will perform all restriction tests on data objects. The result will indicate
 * if all tests passed or if there were some failures, and return a list of the failures that occurred.
 */
export const validate = {
	validateField: _validation.validateField,
	validateRecord: _validation.validateRecord,
	validateSchema: _validation.validateSchema,
	validateDictionary: _validation.validateDictionary,
};

/**
 * Parsing functions will convert the an object with string values into a new object with all values properly typed
 * to match the data types from a schema definition. This parsing process will convert values to numbers, booleans,
 * and arrays, as required. String values may also be cleaned up to trim whitespace and match the casing of codeList
 * values.
 *
 * The parsing functions will return a Result object that will indicate if parsing was successful or if there were
 * string values that could not be converted to the required data types.
 */
export const parse = {
	parseFieldValue: _validation.parseFieldValue,
	parseRecordValues: _validation.parseRecordValues,
	parseSchemaValues: _validation.parseSchemaValues,
	parseDictionaryValues: _validation.parseDictionaryValues,
};
