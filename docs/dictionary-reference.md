# Lectern Dictionary Meta-Schema Refernce

For a high level description of the component parts of a Lectern Dictionary see [Important Concepts - Dictionary Model](./important-concepts.md#dictionary-model).

## Dictionary Structure

A Lectern Dictionary is a collection of Lectern Schemas. Each schema describes the structure of a TSV file, providing a list of the columns for that file and the data types and restrictions on the content of those columns.

In addition to schemas, a Lectern Dictionary can contain reference values that can be reused throughout the schema definitions to define property restrictions with shared rules.

> **Dictionary Structure Example**
> ```json
> {
> 	"name": "example_dictionary",
> 	"description": "Collection of schemas to demonstrate Lectern functionality",
> 	"meta": { /* Custom meta data about the dictionary here */ },
> 
> 	"version": "1.0",
> 
> 	"schemas": [ /* Schemas Here */ ],
> 	"references": { /* Reference Variables Here */ }
> }
> ```

| Property      | Type                                                           | Required | Description                                                                                                                                                                            | Example                                                        |
| ------------- | -------------------------------------------------------------- | -------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `name`        | `string`                                                       | Required | Display name of the dictionary                                                                                                                                                         | `"Example Lectern Dictionary"`                                 |
| `version`     | `string`, as a semantic version number `major`.`minor`.`patch` | Required | Version of the dictionary.                                                                                                                                                             | `"1.23.4"`                                                     |
| `schemas`     | `Array<`[`LecternSchema`](#dictionary-schema-structure)`>`     | Required | An array containing Lectern Schemas. Minimum of 1 Schema is required.                                                                                                                  | [Dictionary Schema Structure](#dictionary-schema-structure)    |
| `description` | `string`                                                       | Optional | Free text description of the schema, for use as a reference for users of the dictionary. This description is not used  by Lcetern for dictionary validation.                           | `"Collection of schemas to demonstrate Lectern functionality"` |
| `meta`        | [MetaData](#meta-data-structure) object                        | Optional | Schema implementor defined fields to capture any additional properties not defined in standard Lectern dictionaries. These properties are not used by Lctern for dictionary validation | `{ "author": "Guy Incognito" }`                                |
| `references`  | [References](#references-structure) object                     | Optional | Reference values that can be referenced throughout the dictionary.                                                                                                                     | `{ "customRegex": { "ncitIds": "^NCIT:C\d+$" } }`              |

### Dictionary Schema Structure
> **Dictionary Schema Example**
> ```json
> {
> 	"name": "example-schema",
> 	"description": "Demonstrating structure of Lectern Schema",
> 	"meta": { /* Custom meta data about the schema here */ },
> 
> 	"fields": [ /* Fields Here */ ]
> }
> ```


| Property      | Type                                                    | Required | Default | Description                                                                                                                                 | Example                                                   |
| ------------- | ------------------------------------------------------- | -------- | ------- | :------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| `name`        | NameString (no whitespace or `.`)                       | Required |         | Name of the schema. This will be used in paths that reference this schema, and for identifying files containing records for this schema.    | `"example-schema"`                                        |
| `fields`      | `Array<`[`LecterField`](#dictionary-field-structure)`>` | Required |         | List of fields contained in this Schema.                                                                                                    | [Dictionary Field Structure](#dictionary-field-structure) |
| `description` | `string`                                                | Optional | None    | Free text description of the schema, for use as a reference for users of the schema. This description is not used in dictionary validation. | `"Demonstrating structure of Lectern Schema"`             |
| `meta`        | [`MetaData`](#meta-data-structure)                      | Optional | None    | Schema implementor defined fields to capture any additional properties not defined in standard Lectern schemas.                             | [Meta Data Structure](#meta-data-structure)               |

### Dictionary Field Structure
> **Example Dictionary Field Definition**
> ```json
> {
> 	"name": "example_field",
> 	"description": "Shows a string field with a required restriction",
> 	"meta": { /* Custom meta data abou the field here */ },
> 	"isArray": false,
> 
> 	"valueType": "string",
> 	"restrictions": {
> 		"required": true
> 	}
> }
> ```

| Property       | Required | Default                | Type                                                | Description                                                                                                                                                                                                                                                                                                                                                              | Example                                              |
| -------------- | -------- | ---------------------- | --------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `name`         | Required |                        | NameString (no whitespace or `.`)                   | Name of the field. This will be used as the header in TSV files in this field's schema, and in any paths referencing this field.                                                                                                                                                                                                                                         | `"example_field`                                     |
| `valueType`    | Required |                        | [Field Data Type](#field-data-types)                | Type of value stored in this field                                                                                                                                                                                                                                                                                                                                       | `"string"`                                           |
| `delimiter`    | Optional | `,`                    | `string`                                            | Character or string that will be used to split multiple values into an array. The default delimiter is a comma `,`. Any characters can be used as a delimiter. The delimiter value can be one or more characters long, but cannot be an empty string.                                                                                                                    | `"\|"` |
| `description`  | Optional | `""` No value          | `string`                                            | Free text description of the field, for use as a reference for users of the schema. This description is not used in dictionary validation.                                                                                                                                                                                                                               | `"Shows a string field with a required restriction"` |
| `meta`         | Optional | Empty object, no value | [`MetaData`](#meta-data-structure) object           | Schema implementor defined fields to capture any additional properties not defined in standard Lectern fields.                                                                                                                                                                                                                                                           | `{ "displayName": "Example Field" }`                 |
| `isArray`      | Optional | `false`                | `boolean`                                           | Type of value stored in this field                                                                                                                                                                                                                                                                                                                                       |                                                      |
| `restrictions` | Optional | No Restrictions        | `RestrictionsObject` or `Array<RestrictionsObject>` | An object containing all validation rules for this field. This can be a single object containing all [restrictions](#field-restrictions) applied to this field or a list of objects whose restrictions will be combined. [Conditional restrictions](#conditional-restrictions) can also be used to apply validation rules based on values of other fields in the record. | `{ "required": true }`                               |
| `unique`       | Optional | `false`                | `boolean`                                           | Indicates that every record in this schema should have a unique value for this field. This rule is applied when a collection of records are validated together, ensuring that no two records in that collection repeat a value.                                                                                                                                          | `true`                                               |



#### Field Data Types

| valueType | Description                                                                                                                                               | Examples                                                    |
| --------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `boolean` | Boolean value, either `true` or `false`. Accepts values with any letter casing, for example `true`, `True`, and `TRUE` will all be interpretted as `true` | `true`, `false`                                             |
| `integer` | Numeric integer value. Will accept positive and negative values (ex. `21` or `-8`) but will reject any decimals (ex. `1.23`)                              | `21`, `-8`                                                  |
| `number`  | Numeric value. Will accept any numeric value, including those with decimals.                                                                              | `1.23`, `-4.567`                                            |
| `string`  | String fields. Value can have any length and use any character, other than the array delimiter for an array field (by default ` \| `)                     | `asdf`, `Hello World`, `Another longer example of a string` |

#### Field Restrictions

Restrictions on a field are a list of rules that all values for this field must adhere to, these are the list of validations on the contents of each field. Two examples of restrictions are that a value is `required`, and that a value must take a value from a list of available options (`codeList`). The full list of available restrictions are described in the table below.

The restrictions property of a field can have a value that is either a single restrictions object, or an array with any number of restrictions objects. If an array of restriction objects is provided, each set of restrictions will be applied in turn - for data to be valid, all restrictions in the array must pass. A restrictions object can either contain a set of restrictions from the table below, or be a [conditional restriction](#conditional-restrictions).

The full list of available restrictions are:

| Restriction | Used with Field Types         | Type                                                            | Description                                                                                                                                                                                                                                                                                       | Examples                                                                                                                                                          |
| ----------- | ----------------------------- | --------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `codeList`  | `integer`, `number`, `string` | Array of type of the field                                      | An array of values of the type matching this field. Data provided for this field must have one of the values in this list.                                                                                                                                                                        | `["Weak", "Average", "Strong"]`                                                                                                                                   |
| `compare`   | all                           | [ComparedFieldsRule](#comparedfieldsrule-data-structure) object | Enforces that this field has a value based on the provided value in another field. Examples would be to ensure that the two values are not equal, or for numeric values ensure one is greater than the other.                                                                                     | `{ "fields": ["age_at_diagnosis"], "relation": "greaterThanOrEqual" }` Ensure that a field such as `age_at_death` is greater than the provided `age_at_diagnosis` |
| `count`     | Array fields of all types     | `integer` or [`RangeRule`](#rangerule-data-structure) object    | Enfroces the number of entries in an array. Can specify an exact array size, or provide range rules that set maximum and minimum counts.                                                                                                                                                          | `7` or `{"min": 5, "max": 10}`                                                                                                                                    |
| `empty`     | all                           |                                                                 | Requires that no value is provided. This is useful when used on a [conditional restriction](#conditional-restrictions) in order to prevent a value from being given when the condition is `true`. For an array field with this restriction, an empty array is a valid value for this restriction. | n/a                                                                                                                                                               |
| `range`     | `integer`, `number`           |                                                                 | Uses a [RangeRule](#rangerule-data-structure) object to define minimum and/or maximum values for this field                                                                                                                                                                                       | `{"min": 5}`, `{"exclusiveMax": 50}`, `{"exclusiveMin": 5, "max": 50}`                                                                                            |
| `regex`     | `string`                      |                                                                 | A regular expression that all values must match.                                                                                                                                                                                                                                                  | `^[a-z0-9]+$`                                                                                                                                                     |
| `required`  | all                           |                                                                 | A value must be provided, missing/undefined values will fail validation. Empty strings will not be accepted, though `0` (for `number` and `int` fields) and `false` (for `boolean` fields) are accepted. An array field with this restriction must have at least one entry.                       | `true`, `false`                                                                                                                                                   |

#### Conditional Restrictions

Restrictions can be added with conditions so that the validations are only applied based on the values provided to other fields within a record.

A conditional restriction uses an if/then/else style syntax:

The `if` property will be an object containing an array of `conditions` that look at other fields on the same record and apply matching rules to their values. When those field values match the rules in the condition than the condition passes. An optional `case` property can be added to the `if` object that defines how many of the `conditions` have to pass in order for the whole condition block to resolve as `true` - default is `all`, requiring all conditions to be met. 

The `then` object contains the restrictions that will be applied when the `if` condition is `true`, and the `else` condition contains restrictions to apply when the `if` condition is `false`. The `then` property is required but using an `else` property is optional.

| Property | Required | Default                       | Type                                                | Description                                                                                                                                                                                                                                                                                                                                                                            | Example                                                                                                |
| -------- | -------- | ----------------------------- | --------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `if`     | Required |                               | `RequirementsConditions`                            | Contains the conditional cases that will be checked before applying this object's restrictions. This object contains a list of `conditions` and a `case` that indicates how many of the conditions need to be found `true` for the entire conditions block to be considered `true`. The case options are `any`, `all`, and `none`, with `all` being default (if case is not provided). | `{ "conditions": [ { "field": "another_field", "match": { "value": "Some Value" }} ], "case": "all" }` |
| `then`   | Required |                               | `RestrictionsObject` or `Array<RestrictionsObject>` | The restriction rules to apply when the `if` condition is found to be `true`.                                                                                                                                                                                                                                                                                                          | `{ "required": true}`                                                                                  |
| `else`   | Optional | Empty object, no restrictions | `RestrictionsObject` or `Array<RestrictionsObject>` | The restriction rules to apply when the `if` condition is found to be `false`.                                                                                                                                                                                                                                                                                                         | `{ "empty": true}`                                                                                     |

```json
{
	"if": {
		"conditions": [ /* Restriction conditions */ ],
		"case": "all"
	},
	"then": {/* Restrictons */} OR [ /* Restrictions objects (restriction values or nested conditional restrictions */ ],
	"else": {/* Restrictons */} OR [ /* Restrictions objects (restriction values or nested conditional restrictions */ ]
}
```

##### Conditions Structure

A requirement condition is defined by providing a field name or list of field names from this schema, and the matching rules that satisfy this condition. If multiple field names are provided, a `case` property can be added to specify how many of their values must pass the matching rules (`all`, `any`, or `none` of them).

| Property         | Required | Default | Type                 | Description                                                                                                                                                                                                                                                                                                                    | Example                      |
| ---------------- | -------- | ------- | -------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `fields`         | Required |         | `Array<NameString>`  | Names of fields from the same schema. This match rule will be applied to all fields listed - see `case` to determine the rules for how many of these fields must match. All specified fields must store values of the same type.                                                                                               | `["some_field"]`             |
| `match`          | Required |         | `MatchRules` object  | Matching rules for the values of the `fields`. All rules included in this object will be tested and all must be pass - this is not affected by the `case` property. [Conditional Match Rules](#conditional-match-rules)                                                                                                        | `{ "value": "Hello World" }` |
| `arrayFieldCase` | Optional | `all`   | `all`, `any`, `none` | When a specified field is an array type, the `arrayFieldCase` dictates how many of the values in the array must pass the matching rules. `all` requires all values in the array to pass the matching rule. `any` requires at least one value in the array to match. `non` requires that none of the values in the array match. | `any`                        |
| `case`           | Optional | `all`   | `all`, `any`, `none` | Defines how many of the listed `fields` must have a value that matches the `match` rules. `all` requires all fields values to have matching values. `any` requires at least one field to have a matching value. `none` requires that there none of the specified fields have values that match.                                | `any`                        |

> **Example Conditional Restriction**: match single value
> 
> Condition where `shirt_size` is `Small`
> ```json
> {
> 	"fields": ["shirt_size"],
> 	"match": {
> 		"value": "Small"
> 	}
> }
> ```

> **Example Conditional Restriction**: match value from list
> 
> Condition where `shirt_size` is any value in a list (`Medium` or `Large`)
> ```json
> {
> 	"fields": ["shirt_size"],
> 	"match": {
> 		"codeList": ["Medium", "Large`"]
> 	}
> }
> ```

##### Conditional Match Rules
| Property   | Used with Field Types | Type                                               | Description                                                                                                                                                                                                                                                                                                                                                                                                                    | Example                                                                                                |
| ---------- | --------------------- | -------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `codeList` | all                   | Array of type of specified fields                  | A list of values that the field could match. This rule passes when the specified field's value can be found in this list.                                                                                                                                                                                                                                                                                                      | `["value_one", "value_two"]`                                                                           |
| `count`    | Array type fields     | Integer, or [RangeRule](#rangerule-data-structure) | Matches the number of values in an array field. This condition can be provided as a number, in which case this condition matches if the array is that exact length. This condition can be provided as a Range object as well, in which case it will match if the number of elements in the array pass the minimum and maximum conditions provided in the condition.                                                            | `2` - Field must have exactly 2 elements. </br> `{ max: 10 }` - Field must have no more than 10 items. |
| `exists`   | all                   | Boolean                                            | This condition requires a field to either have a value or have no value. When the `exists` condition is set to `true`, the field must have a value. When `exists` is sdet to `false`, the field must have no value. For array fields, `exists=false` only matches when the array is completely empty, and `exists=true` passes if the array has 1 or more values - `arrayCase` has no interaction with the `exists` condition. | `true`                                                                                                 |
| `range`    | `number`, `integer`   | [RangeRule](#rangerule-data-structure)             | Maximum and minimum value conditions that a numeric field must pass.                                                                                                                                                                                                                                                                                                                                                           | `{ min: 5, exclusiveMax: 10 }` Represents an integer from 5-9.                                         |
| `regex`    | `string`              | String (Regular Expression)                        | A regular expression pattern that the value must match.                                                                                                                                                                                                                                                                                                                                                                        | `^NCIT:C\d+$` Value must match an NCI Thesaurus ID.                                                    |
| `value`    | all                   | Type of specified fields                           | Field value matches the value of the specified field. Strings are matched case insensitive. When arrays are matched, the order of their elements is ignored - a field matches this condition if the elements in field are the same elements as in the value match rule. For example, the rule `['abc', 'def']` matches the value `['def', 'abc']` but does not match `['abc', 'def', 'ghi']`.                                  | `some_value`, `[1, 2, 3]`                                                                              |

### Meta Data Structure

> **Meta Example**
> ```json
> {
> 	"displayName": "Nicely Formatted Name",
> 	"externalReferenceId": "ABCD:1234",
> 	"exampleBooleanPropery": true,
> 	"exampleNumericProperty": 123
> }
> ```

A `meta` object is available to allow the dictionary creator to add custom properties to the Lectern Dictionary. The `meta` property is available to all Dictionary, Schema, and Field objects. Providing a `meta` value is optional. If provided the `meta` value is a JSON object. There are no restrictions on the field names that can be added to the `meta` object other than they must be valid JSON. The values for properties of the `meta` can either be another nested meta object, or are one of the allowed value types:
  - `string`
  - `number`
  - `boolean`
  - `Array<string>`
  - `Array<number>`

### References Structure

References are defined at the dictionary level so they can be reused across schemas. References can be used to store values that can be used in `meta` or `restrictions`

#### Using References
Reference variables can be used in a `meta` object or a `restrictions` object as either a restriction value or a conditional match value.

To use a reference, replace the value in the value of the meta or restriction property with a string containing a `ReferenceTag`. A `ReferenceTags` 

### RangeRule Data Structure

> **RangeRule Example**
> ```json
> {
> 	"min": 5,
> 	"exclusiveMax": 10
> }
> ```

`RangeRule` objects are used to define restrictions and conditions where a numeric minimum or maximum needs to be defined. This object must define at least 1 property (ie. could define a minimum but not maximum, or vice-versa).

There is an inclusive and an exclusive version of the minimum and maximum properties. `min` and `max` are _inclusive_, and the alternate form `exclusiveMin` and `exclusiveMax` are _exclusive_. By example, `{ "min":5 }` allows the value `5` and greater, while `{ "exclusiveMin": 5 }` allows only values greater than `5` but not `5` itself.

A `RangeRule` cannot include but an inclusive and exclusive version of min, or of max (ie. it cannot have `min` and `exclusiveMin`.)

| Property       | Description                                                       |
| -------------- | :---------------------------------------------------------------- |
| `exclusiveMax` | Allows values less than this value, but not this value itself.    |
| `exclusiveMin` | Allows values greater than this value, but not this value itself. |
| `max`          | Allows this value and values lesser than this value.              |
| `min`          | Allows this value and values greater than this value.             |

### ComparedFieldsRule Data Structure

> **ComparedFieldsRule** Example
> 
> ```json
> {
> 	"fields": "some_field",
> 	"relation": "equal",
> }
> ```

| Property   | Required | Default              | Type                                                                                                                   | Description                                                                                                                                                                                                               |
| ---------- | -------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `fields`   | Required |                      | `string` or `Array<string>`                                                                                            | The field(s) that the values of will be compared to. These fields will be refered to throughout this section as _compared to_ fields. All these fields need to be the same type as the field(s) they will be compared to. |
| `relation` | Required |                      | `equal`, `notEqual`, `contains`, `containedIn`, `greaterThan`, `greaterThanOrEqual`, `lesserThan`, `lesserThanOrEqual` | The relation between the values of the test field and the compared to fields. See [ComparedFieldsRule Relations](#comparedfieldsrule-relations).                                                                          |
| `case`     | Optional | `all`, `any`, `none` | MatchCase (RangeRule or one of: `all`, `any`, `none`)                                                                  | How many of the _compared to_ fields must pass the comparison for this rule to pass.                                                                                                                                      |

#### ComparedFieldsRule Relations

| Relation Value           | Allowable Field Types | Description                                                                                                |
| ------------------------ | --------------------- | :--------------------------------------------------------------------------------------------------------- |
| **`equal`**:             | all                   | Checks that the current field and the comapred field(s) have the same value                                |
| **`notEqual`**:          | all                   | Checks that the current field and the comapred field(s) do not have the same value                         |
| **`contains`**           | `string`              | Checks that the value of the current field completely contains the value of the compared field(s)          |
| **`containedIn`**        | `string`              | Checks that the value of the current field is completely contained in the value of the compared field(s)   |
| **`greaterThan`**        | `number`, `integer`   | Checks that the value of the current field is greater than (exclusive) the value of the compared field(s). |
| **`greaterThanOrEqual`** | `number`, `integer`   | Checks that the value of the current field is greater than or equal to the value of the compared field(s). |
| **`lesserThan`**         | `number`, `integer`   | Checks that the value of the current field is lesser than (exclusive) the value of the compared field(s).  |
| **`lesserThanOrEqual`**  | `number`, `integer`   | Checks that the value of the current field is lesser than or equal to the value of the compared field(s).  |

## Source Code Reference

Source code for the Lectern Dictionary meta-schema is made available through the package [@overture-stack/lectern-dictionary](../packages/dictionary/). The meta-schema is formally defined in TypeScript and exported as the type `Dictionary` from the file [`dictionary/src/types/dictionaryTypes.ts`](../packages/dictionary/src/types/dictionaryTypes.ts). This definition is created using [`Zod`] schemas, which are also exported from this package and available for use to confirm a given object is a valid Lectern Dictionary.