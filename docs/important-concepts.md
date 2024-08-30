# Important Concepts

This document is a reference of commonly used terms and definitions.

## Dictionary Model

Lectern provides a "meta-schema" which describes a syntax for creating Data Dictionaries. This meta-schema is a set of rules for a JSON document, and any JSON document that correctly applies these rules represents a valid Lectern Dictionary. The meta-schema is defined through code rules in the [@overture-stack/lectern-dictionary](../packages/dictionary) package. 

A [JSON-schema version of this meta-schema](../generated/DictionaryMetaSchema.json) has been generated and is included in this code base.

This section describes at a high level the component parts of a Lectern Dictionary and the terms used when discussing those parts. The terms defined here are used throughout the documentation and the type system of the Lectern codebase. If you are writing a Lectern Dictionary, you may instead be looking for the [reference documentation for Lectern Dictionaries]().

### Dictionary

Placeholder

### Schema

Placeholder

### Field

Placeholder

#### Data Type

Placeholder

### Restrictions

Placeholder

#### Schema Restriction

Placeholder

#### Field Restriction

Placeholder

##### Conditional Field Restriction

Placeholder

### Meta

Placeholder

## Common Types

### DataRecord and UnprocessedDataRecord
The `DataRecord` type represents a single record from some Schema. They are objects with keys that match the [fields](#field) from a [schema](#schema) and a value that should be one of the valid Lectern data types. There is no guarantee that a `DataRecord` is "valid", it could have values that fail some restrictions from the schema.

An `UnprocessedDataRecord` is very similar, but all values are raw string values. These represent a single record as it would be submitted in a test file, for example all the data from a single line in a TSV. These string values will need to be [parsed](#parsing) to be converted to their proper types as defined in a schema.

### TestResult

Reference: [validation/src/types/testResult.ts](../packages/validation/src/types/testResult.ts)

A `TestResult` represents the outcome of a validation test applied to an object. For example, a [`Field`](#field) will be validated based on its [Restrictions](#field-restriction) and this will generate a `TestResult` that will contain a list of `ValidationTestErrors` if the field is found to be invalid for one or more reasons.

The TestResult object indicates if the object tested was **valid** or **invalid** (`valid: true`) for the given test. When the value is **invalid**, additional information should be included in the result that describes the conditions that the test failed.

Example Valid `TestResult`:

```ts
{
	valid: true
}
```

Example Invalid `TestResult`, for a field validation that failed due to CodeList restriction:

```ts
{
	valid: false,
	details: {
		reason: "INVALID_BY_RESTRICTION",
		value: "Atari",
		errors: [
			{
				type: "codeList",
				rule: ["Nintendo", "Sega", "PlayStation", "Xbox"]
			}
		]
	}
}
```

## Data Processing Verbs

### Parsing

Placeholder

### Validating

Placeholder

### Processing

Placeholder