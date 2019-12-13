import MetaSchema from '../config/MetaSchema.json';
import Ajv from 'ajv';
import { replaceSchemaReferences } from './dictionaryService';

export function validate(schema: any, references: any) {
  const schemaWithReplacements = replaceSchemaReferences(schema, references);

  // Validate vs MetaSchema
  const ajv = new Ajv({
    allErrors: true,
    jsonPointers: true,
  });
  const validate = ajv.compile(MetaSchema);
  const metaSchemaValid = validate(schemaWithReplacements);

  return { valid: validate(schemaWithReplacements), errors: validate.errors };
}
