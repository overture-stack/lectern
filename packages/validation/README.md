# Lectern Validation 

![Typescript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
[<img hspace="5" src="https://img.shields.io/badge/chat--with--developers-overture--slack-blue?style=for-the-badge">](http://slack.overture.bio)
[<img hspace="5" src="https://img.shields.io/badge/License-AGPL--3.0-blue?style=for-the-badge">](https://github.com/overture-stack/lectern/blob/develop/LICENSE)


> **Note**
>
> This may not be the module you are looking to import.
> 
> This is a sub-module used as a dependency by both the [Lectern Client](https://www.npmjs.com/package/@overture-stack/lectern-client) and [Lectern Server](https://github.com/overture-stack/lectern/blob/develop/apps/server/README.md). 
>
> If you are building an application that will interact with a Lectern Server over HTTP, or wants to validate data using a Lectern Dictionary, you likely want to import the [Lectern Client](https://www.npmjs.com/package/@overture-stack/lectern-client).

This package provides tools to parse and validate data based on the schemas in Lectern Dictionaries.

## Parsing Data
Parsing data involves reading string values for fields defined in a Lectern Schema and converting the that value into properly typed data. For example, if a field has `"dataType": "number"` and the provided value `"123"` this will be converted from the string value into the numeric `123`. A more complicated example would take a comma separated array value and convert each element and return the final array. If any values cannot be properly parsed and converted based on the schema's rules, an error is returned instead.

There are four separate parsing functions exported, mapping to different collections of data to be processed together:

- `parseFieldValue`: Parse a string value for an individual field.
- `parseRecordValues`: Parse all fields in an [UnprocessedDataRecord](https://github.com/overture-stack/lectern/blob/develop/docs/important-concepts.md#datarecord-and-unprocesseddatarecord) based on a schema definition. Applies `parseFieldValue` to each field.
- `parseSchemaValues`: Parse all records in a collection belonging to an individual [schema](https://github.com/overture-stack/lectern/blob/develop/docs/important-concepts.md#schema). Applies `parseRecordValues` to each record.
- `parseDictionaryValues`: Parse all records for multiple schemas in a [dictionary](https://github.com/overture-stack/lectern/blob/develop/docs/important-concepts.md#dictionary). Applies `parseSchemaValues` to each array of records provided.

Each parsing function will return a Result object that indicates if the parsing completed successfully. When parsing completes without any errors the response will include the parsed data with all fields converted to the correct type.

If the parsing failed, part of the response will be an array of errors indicating which record and which fields had parsing errors. The response will also include the partially parsed data record(s); fields that were succesfully parsed will have been updated to their correct data types, but fields that failed to parse will still contain their original string values.

## Validating Data

Validation functions are provided to test parsed DataRecords with all restrictions defined in a Lectern dictionary. These functions will identify all restrictions that must be tested from the provided schema and apply these to the given data, including resolving conditional restrictions. Different restrictions are applied depending on which data collection is provided; validating an individual fields will only test field level restrictions, while validating a whole schema will also validated `unique` and `uniqueKey` constraints.

There are four main validation functions, provided to validate data at the field, record, schema, and dictionary levels:

- `validateField`: Validate the field value, testing all field level restrictions such as `regex`, and `codeList`
- `validateRecord`: Validate all fields in a record, testing that all fields belong to that schema, that all required fields are present, and applying `validateField` to all fields in the record.
- `validateSchema`: Validate a collection of records from a single schema, testing all `unique` and `uniqueKey` requirements for that schema and then applying `validateRecord` to all records.
- `validateDictionary`: Validates multiple collections of records each belonging to schemas from a dictionary.  This checks that each schema specified is a member of the given dictionary, and tests `foreignKey` restrictions on each schema, in addition to applying `validateSchema` to each colleciton.

All validation functions return a [`TestResult`](https://github.com/overture-stack/lectern/blob/develop/docs/important-concepts.md#testresult) object that will indicate if the validation passed or failed. If the validation is successful then this result will simply indicate that the data is valid. If there were any errors then the response will include a error information.

