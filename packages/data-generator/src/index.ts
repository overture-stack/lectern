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

export {
	type DataFileHandle,
	type WriteRecordError,
	openDataFile,
	openTsvFile,
	openCsvFile,
	writeRecord,
	closeDataFile,
} from './dataFile/dataFileWriter';
export { generateSchemaFile, generateDictionaryFiles, type GenerateFileError } from './dataFile/dataFileGenerator';
export {
	FieldGenerator,
	FieldGeneratorFailureData,
	FieldGeneratorOptions,
	FieldGeneratorResult,
	generateBooleanValue,
	generateIntegerValue,
	generateNumberValue,
	generateStringValue,
} from './dataGeneration/fields/fieldGenerators';
export {
	extractFieldDependencies,
	resolveGenerationOrder,
	type FieldDependencyMap,
	type FieldGenerationOrder,
} from './dataGeneration/records/fieldDependencies';
export {
	generateRecord,
	type ForeignKeyPool,
	type RecordGeneratorOptions,
} from './dataGeneration/records/recordGenerator';
export { generateSchemaRecords, type SchemaGeneratorOptions } from './dataGeneration/records/schemaGenerator';
export {
	generateDictionaryRecords,
	type DictionaryGeneratorOptions,
	type DictionaryRecord,
	type DictionarySchemaCount,
} from './dataGeneration/dictionary/dictionaryGenerator';
export { collectRestrictions, CollectedRestrictions } from './dataGeneration/fields/resolveRestrictions';
