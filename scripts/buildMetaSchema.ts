/**
 * This script will output a JSON Schema file which contains the complete Dictionary type definition.
 * It will be output into the file ./generated/DictionaryMetaSchema.json
 */
import fs from 'fs';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { Dictionary, DictionaryMeta, Schema, SchemaField, NameString } from '../src/types/dictionaryTypes';
import { References } from '../src/types/referenceTypes';

const OUTPUT_FILE_LOCATION = './generated/DictionaryMetaSchema.json';

console.log('Generating JSON Schema Meta-Schema...');
const jsonSchema = zodToJsonSchema(Dictionary, {
	name: 'Dictionary',
	definitions: {
		Meta: DictionaryMeta,
		Name: NameString,
		References,
		Schema,
		SchemaField,
	},
});

console.log(`Meta-Schema generated, saving to '${OUTPUT_FILE_LOCATION}'...`);
fs.writeFileSync(OUTPUT_FILE_LOCATION, JSON.stringify(jsonSchema, null, 2));

console.log('Finished Meta-Schema generation.');
