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

import type { DataRecordValue, SchemaField } from 'dictionary';
import { isBooleanArray, isInteger, isIntegerArray, isNumber, isNumberArray, isStringArray } from './typeUtils';

/**
 * Checks that a value matches the expected type for a given field, based on the value type specified in its field
 * definition.
 *
 * @param value Value to check
 * @param fieldDefinition Field definition that specifies the expected value type
 * @returns `true` if value matches the expected type; `false` otherwise.
 */
export const isValidValueType = (value: DataRecordValue, fieldDefinition: SchemaField): boolean => {
	switch (fieldDefinition.valueType) {
		case 'boolean': {
			return fieldDefinition.isArray ? isBooleanArray(value) : typeof value === 'boolean';
		}
		case 'integer': {
			return fieldDefinition.isArray ? isIntegerArray(value) : isInteger(value);
		}
		case 'number': {
			return fieldDefinition.isArray ? isNumberArray(value) : isNumber(value);
		}
		case 'string': {
			return fieldDefinition.isArray ? isStringArray(value) : typeof value === 'string';
		}
	}
};
