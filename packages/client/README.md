# Lectern Client

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
[<img hspace="5" src="https://img.shields.io/badge/chat--with--developers-overture--slack-blue?style=for-the-badge">](http://slack.overture.bio)
[<img hspace="5" src="https://img.shields.io/badge/License-AGPL--3.0-blue?style=for-the-badge">](https://github.com/overture-stack/lectern/blob/develop/LICENSE)

The Lectern Client provides developers TypeScript code tools to interact with Lectern servers and [Lectern Dictionaries](https://github.com/overture-stack/lectern). This package provides data processing functions that will parse and validate submitted data, ensuring that it adheres to the structure defined by the Dictionary. It also provides a REST client to fetch Lectern Dictionary data from a Lectern Server.

## Features
- REST client to interact with Lectern servers:
  - Fetch dictionary by name and version
  - Fetch difference summaries between dictionary versions
- [Process data](#data-processing) using a Lectern Dictionary:
  - Convert raw string inputs into properly typed values.
  - Check the structure of input data is valid.
  - Apply all restrictions, both across schemas and on individual fields, to validate input data.
  - Report all validation errors found in the input data.
- Expose [Lectern Validation](https://www.npmjs.com/package/@overture-stack/lectern-validation) library functionality:
  - Parsing functions to check and convert data types from string values
  - Validation functions to confirm the structure and content of records match Lectern schemas
  - This functionality is combined in the Processing functions

## Developer Examples
### Data Fetching

Data fetching from a lectern service can be perfromed through the `rest` module:

```ts
import * as lectern from '@overture-stack/lectern-client';

const lecternUrl = 'http://lectern.example.com';
const dictionaryName = 'my-example-schemas';
const dictionaryVersion = "2.3";

const allAvailableDictionariesResult = await lectern.rest.listDictionaries(lecternUrl);
const filteredByNameDictionariesResult = await lectern.rest.listDictionaries(lecternUrl, {name: dictionaryName});

const exampleDicionaryResult = await lectern.rest.fetchDiff(lecternUrl, {name: dictionaryName, version: dictionaryVersion});

if(exampleDicionaryResult.success) {
	// use the data:
	console.log(JSON.stringify(exampleDicionaryResult.data));
}
```

Responses from the rest calls will be [`Result`](../dictionary/src/types/result.ts) objects. Before using the data, check that `exampleDicionaryResult.success` is true, and if so, you can get the fully typed response data in `exampleDicionaryResult.data`.


### Data Processing

The following example shows how to process data using the Lectern Client. The input `donorData` is presented as hardcoded, but in a typical scenario this would be submitted to the application through an uploaded TSV, form entry, or similar user submission system.

To process data records which all belong to the same schema we use the `processSchema` function:

```ts
import * as lectern from '@overture-stack/lectern-client';


const dictionary = await getLecternDictionary();

const donorData = [{submitter_donor_id: "abc123", gender: "Male", age: "28"}, {submitter_donor_id: "def456", gender: "Female", age: "37"}]

const schemaProcessingResult = lectern.process.processSchema(dictionary, "donors", donorData);

switch (schemaProcessingResult.status) {
	case 'SUCCESS': {
		const { records } = schemaProcessingResult;
		// use converted and validated records
	}
	case 'ERROR_PARSING': {
		const {  errors, records } = schemaProcessingResult;
		// errors occured parsing records. read the errors that occurred
		// records have been return with their values parsed where possible. If an error occurred, the original input string value is returned
	}
	case 'ERROR_VALIDATION': {
		const { records, errors } = schemaProcessingResult;
		// errors occured validating records. these errors have been returned
		// records were parsed successfully, so this returns all parsed records
	}
```

## Lectern Dependencies
The Lectern Client is a wrapper around Lectern submodules that allow functionality to be shared between client and server implementations. If you do not need the REST client, or the combined processing functions, you can consider including submodules directly to access the specific pieces of functionality you require.

| Package            | Description                                                                                                                                                                                                                                               |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [lectern-dictionary](https://www.npmjs.com/package/@overture-stack/lectern-dictionary) | Definition of the Lectern Dictionary structure. Includes TS types and schemas for validating the content of Lectern dictionary. Also includes functionality to comparing multiple Lectern Dictionary versions, and to analyze the differences between them. |
| [lectern-validation](https://www.npmjs.com/package/@overture-stack/lectern-validation) | Provides functionality for validating data against a Lectern dictionary.                                                                                                                                                                                  |