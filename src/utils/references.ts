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
