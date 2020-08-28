/*
 * Copyright (c) 2020 The Ontario Institute for Cancer Research. All rights reserved
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

import { DictionaryDocument } from '../models/Dictionary';
import { InvalidReferenceError } from '../utils/errors';
import { get, omit, cloneDeep } from 'lodash';

/**
 *
 * @param dictionary Dictionary object, matching the mongoose documents
 * @returns Dictionary with replacements made
 */
export const replaceReferences = (dictionary: DictionaryDocument) => {
  const { schemas, references } = dictionary;

  const updatedSchemas = schemas.map(schema => replaceSchemaReferences(schema, references));
  const clone = cloneDeep(dictionary);
  clone.schemas = updatedSchemas;
  // Remove references property
  return omit(clone, 'references');
};

/**
 * @param schema
 * @param references
 * @return schema clone with references replaced
 */
export const replaceSchemaReferences = (schema: any, references: any) => {
  const isReferenceValue = (value: string) => {
    const regex = new RegExp('^#(/[-_A-Za-z0-9]+)+$');
    return regex.test(value);
  };

  const referenceToObjectPath = (value: string) => {
    return value
      .split('/')
      .slice(1)
      .join('.');
  };

  const clone = cloneDeep(schema);

  const referenceSections = ['restrictions', 'meta'];

  clone.fields.forEach((field: any) => {
    referenceSections.forEach(section => {
      for (const key in field[section]) {
        const value = field[section][key];

        if (isReferenceValue(value)) {
          const reference = referenceToObjectPath(value);

          const replaceValue = get(references, reference, undefined);

          // Ensure we found a value, otherwise throw error for invalid reference
          if (!replaceValue) {
            throw new InvalidReferenceError(
              `Unknown reference found - Schema: ${clone.name} Field: ${
                field.name
              } - Path: ${section}.${key} - Reference: ${reference} `,
            );
          }

          field[section][key] = replaceValue;
        }
      }
    });
  });
  return clone;
};
