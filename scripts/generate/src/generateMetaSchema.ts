/**
 * This script will output a JSON Schema file which contains the complete Dictionary type definition.
 * It will be output into the file ./generated/DictionaryMetaSchema.json
 */
import {
	Dictionary,
	DictionaryMeta,
	NameString,
	ReferenceArray,
	ReferenceTag,
	References,
	Schema,
	SchemaField,
} from 'dictionary';
import fs from 'fs';
import { zodToJsonSchema } from 'zod-to-json-schema';

const OUTPUT_FILE_LOCATION = '../generated/DictionaryMetaSchema.json';

console.log('Generating JSON Schema Meta-Schema...');
const jsonSchema = zodToJsonSchema(Dictionary, {
	name: 'Dictionary',
	definitions: {
		ReferenceTag,
		ReferenceArray,
		References,
		Meta: DictionaryMeta,
		Name: NameString,
		Schema,
		SchemaField,
	},
});

console.log(`Meta-Schema generated, saving to '${OUTPUT_FILE_LOCATION}'...`);
fs.writeFileSync(OUTPUT_FILE_LOCATION, JSON.stringify(jsonSchema, null, 2));

console.log('Finished Meta-Schema generation.');
