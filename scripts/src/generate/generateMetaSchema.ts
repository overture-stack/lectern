/**
 * This script will output a JSON Schema file which contains the complete Dictionary type definition.
 * It will be output into the file ./generated/DictionaryMetaSchema.json
 */
import {
	BooleanFieldRestrictions,
	ConditionalRestrictionTest,
	Dictionary,
	DictionaryMeta,
	IntegerFieldRestrictions,
	NameValue,
	NumberFieldRestrictions,
	ReferenceArray,
	ReferenceTag,
	References,
	Schema,
	SchemaBooleanField,
	SchemaField,
	SchemaIntegerField,
	SchemaNumberField,
	SchemaStringField,
	StringFieldRestrictions,
} from '@overture-stack/lectern-dictionary';
import fs from 'fs';
import { zodToJsonSchema } from 'zod-to-json-schema';

const OUTPUT_FILE_LOCATION = '../generated/DictionaryMetaSchema.json';

console.log('Generating JSON Schema Meta-Schema...');
const jsonSchema = zodToJsonSchema(Dictionary, {
	name: 'Dictionary',
	definitions: {
		SchemaBooleanField,
		SchemaIntegerField,
		SchemaNumberField,
		SchemaStringField,
		BooleanFieldRestrictions,
		IntegerFieldRestrictions,
		NumberFieldRestrictions,
		StringFieldRestrictions,
		ConditionalRestrictionTest,
		Meta: DictionaryMeta,
		Name: NameValue,
		ReferenceArray,
		ReferenceTag,
		References,
		Schema,
		SchemaField,
	},
});

console.log(`Meta-Schema generated, saving to '${OUTPUT_FILE_LOCATION}'...`);
fs.writeFileSync(OUTPUT_FILE_LOCATION, JSON.stringify(jsonSchema, null, 2));

console.log('Finished Meta-Schema generation.');
