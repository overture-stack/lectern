# Lectern Client

[![NPM Version](https://img.shields.io/npm/v/@overture-stack/lectern-client?color=%23cb3837&style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@overture-stack/lectern-client)

The Lectern client provides developers the mechanism to interact with Lectern servers and to use Lectern Dictionaries. The client provides all the validation logic to check that submitted data is valid based on the structure and restrictions of a Lectern dictionary. It also provides a REST client to fetch Lectern Dictionary data from a Lectern server.

## Features
- Interact with lectern servers:
  - Fetch dictionary by name and version
  - Fetch difference summaries between dictionary versions
- Process data using a Lectern Dictionary:
  - Convert raw string inputs into properly typed values.
  - Check the structure of input data is valid.
  - Apply all restrictions, both across schemas and on individual fields, to validate input data.
  - Report all validation errors found in the input data.


## Data Fetching Example

```ts
import * as lectern from '@overture-stack/lectern-client';

const lecternUrl = 'http://lectern.example.com';
const dictionaryName = 'dictionary-name';
const currentVersion = "2.3";
const previousVersion = "2.1";

const dictionary = lectern.restClient.fetchSchema(lecternUrl, dictionaryName, currentVersion);
const versionUpdates = lectern.restClient.fetchDiff(lecternUrl, dictionaryName, currentVersion, previousVersion);
```

## Data Processing Usage

### Process Data for a Single Schema

The following example shows how to process data using the Lectern Client. The input `donorData` is presented as hardcoded, but in a typical scenario this would be submitted to the application through an uploaded TSV, form entry, or similar user submission system.

To process data records which all belong to the same schema we use the `processSchema` function:

```ts
import * as lectern from '@overture-stack/lectern-client';


const dictionary = await getLecternDictionary();

const donorData = [{submitter_donor_id: "abc123", gender: "Male", age: "28"}, {submitter_donor_id: "def456", gender: "Female", age: "37"}]

const schemaProcessingResult = lectern.functions.processSchema(dictionary, "donors", donorData);

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
