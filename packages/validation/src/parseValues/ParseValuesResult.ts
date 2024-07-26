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

import type { DataRecord } from 'dictionary';
import type { RecordValidationErrorInvalidValue, RecordValidationErrorUnrecognizedField } from '../validateRecord';
import type { SchemaRecordError } from '../validateSchema';
import type { Result } from 'common';

export type ParseFieldError = RecordValidationErrorInvalidValue | RecordValidationErrorUnrecognizedField;

export type ParseRecordFailureData = { record: DataRecord; errors: ParseFieldError[] };
export type ParseRecordResult = Result<{ record: DataRecord }, ParseRecordFailureData>;

export type ParseSchemaError = SchemaRecordError<ParseFieldError>;
export type ParseSchemaFailureData = { records: DataRecord[]; errors: ParseSchemaError[] };
export type ParseSchemaResult = Result<{ records: DataRecord[] }, ParseSchemaFailureData>;

export type ParseDictionaryErrorUnrecognizedSchema = { reason: 'UNRECOGNIZED_SCHEMA' };
export type ParseDictionaryErrorInvalidRecords = {
	reason: 'INVALID_RECORDS';
	errors: ParseSchemaError[];
};

export type ParseDictionaryFailure = { records: DataRecord[] } & (
	| ParseDictionaryErrorUnrecognizedSchema
	| ParseDictionaryErrorInvalidRecords
);

export type ParseDictionaryData = Record<string, Result<{ records: DataRecord[] }, ParseDictionaryFailure>>;

export type ParseDictionaryResult = Result<ParseDictionaryData, ParseDictionaryData>;
