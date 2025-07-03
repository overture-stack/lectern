# Dictionary Syntax

A Lectern Dictionary is a JSON configuration that defines the structure and validation rules for tabular data files. It consists of schemas that describe individual file formats, with each schema containing field definitions and validation constraints.

## Basic Dictionary Structure

A Lectern Dictionary is a JSON configuration file that defines the structure and validation rules for your data files. At its core, every dictionary must contain three essential components: a **name**, **version**, and at least one **schema**. Additional optional components like descriptions, metadata, and references can enhance functionality.

```json showLineNumbers {2-3,9-26}
{
  "name": "clinical_data_dictionary",
  "version": "1.2.0",
  "description": "Clinical trial data collection schemas",
  "meta": {
    "author": "Clinical Data Team",
    "created": "2024-01-15"
  },
  "schemas": [
    {
      "name": "patient",
      "description": "Patient demographic and clinical information",
      "fields": [
        {
          "name": "patient_id",
          "valueType": "string",
          "restrictions": {
            "required": true,
            "regex": "^PAT-\\d{6}$"
          },
          "unique": true,
          "description": "Unique patient identifier in format PAT-XXXXXX"
        }
      ]
    }
  ],
  "references": {
    "customRegex": {
      "dateFormat": "^\\d{4}-\\d{2}-\\d{2}$"
    }
  }
}
```

### Basic Dictionary Properties

| Property      | Type            | Required | Description                            | Example                                         |
| ------------- | --------------- | -------- | -------------------------------------- | ----------------------------------------------- |
| `name`        | `string`        | ✓        | Display name of the dictionary         | `"clinical_data_dictionary"`                    |
| `version`     | `string`        | ✓        | Semantic version (major.minor.patch)   | `"1.2.0"`                                       |
| `schemas`     | `Array<Schema>` | ✓        | List of schema definitions (minimum 1) | See [Schema Structure](#basic-schema-structure) |
| `description` | `string`        | ✗        | A human-readable description           | `"Clinical trial data schemas"`                 |
| `meta`        | `object`        | ✗        | Custom metadata fields                 | `{"author": "Clinical Data Team"}`              |
| `references`  | `object`        | ✗        | Reusable reference values              | See [References](#references)                   |

## Basic Schema Structure

Each schema defines the structure of a single tabular data file. Every dictionary must have a **name** and **fields** array.

```json showLineNumbers {11,13-26}
{
  "name": "clinical_data_dictionary",
  "version": "1.2.0",
  "description": "Clinical trial data collection schemas",
  "meta": {
    "author": "Clinical Data Team",
    "created": "2024-01-15"
  },
  "schemas": [
    {
      "name": "patient",
      "description": "Patient demographic and clinical information",
      "fields": [
        {
          "name": "patient_id",
          "valueType": "string",
          "restrictions": {
            "required": true,
            "regex": "^PAT-\\d{6}$"
          },
          "unique": true,
          "description": "Unique patient identifier in format PAT-XXXXXX"
        }
      ]
    }
  ],
  "references": {
    "customRegex": {
      "dateFormat": "^\\d{4}-\\d{2}-\\d{2}$"
    }
  }
}
```

### Schema Properties

| Property      | Type           | Required | Description                           |
| ------------- | -------------- | -------- | ------------------------------------- |
| `name`        | `string`       | ✓        | Schema identifier (no spaces or dots) |
| `fields`      | `Array<Field>` | ✓        | List of field definitions             |
| `description` | `string`       | ✗        | Human-readable description            |
| `meta`        | `object`       | ✗        | Custom metadata                       |

## Field Definitions

Fields define the individual columns in your data files, at minimum a field object must have a **name** and **valueType**.

```json showLineNumbers {15,17,25,27}
{
  "name": "clinical_data_dictionary",
  "version": "1.2.0",
  "description": "Clinical trial data collection schemas",
  "meta": {
    "author": "Clinical Data Team",
    "created": "2024-01-15"
  },
  "schemas": [
    {
      "name": "patient",
      "description": "Patient demographic and clinical information",
      "fields": [
        {
          "name": "patient_id",
          "description": "Unique patient identifier in format PAT-XXXXXX",
          "valueType": "string",
          "restrictions": {
            "required": true,
            "regex": "^PAT-\\d{6}$"
          },
          "unique": true
        },
        {
          "name": "diagnosis_date",
          "description": "Date of initial diagnosis in YYYY-MM-DD format",
          "valueType": "string",
          "meta": {
            "displayName": "Diagnosis Date",
            "category": "clinical"
          },
          "restrictions": {
            "required": true,
            "regex": "dateFormat"
          }
        }
      ]
    }
  ],
  "references": {
    "customRegex": {
      "dateFormat": "^\\d{4}-\\d{2}-\\d{2}$"
    }
  }
}
```

### Field Properties

| Property       | Type           | Required | Default | Description                                               |
| -------------- | -------------- | -------- | ------- | --------------------------------------------------------- |
| `name`         | `string`       | ✓        | -       | Field identifier (used as a column header)                |
| `description`  | `string`       | ✗        | `""`    | Human-readable description                                |
| `valueType`    | `string`       | ✓        | -       | Data type: `string`, `integer`, `number`, `boolean`       |
| `isArray`      | `boolean`      | ✗        | `false` | Whether field accepts multiple values                     |
| `delimiter`    | `string`       | ✗        | `","`   | Separator for array values                                |
| `unique`       | `boolean`      | ✗        | `false` | Whether values must be unique across records              |
| `restrictions` | `object/array` | ✗        | `{}`    | Where the validation rules/logic for the field is defined |
| `meta`         | `object`       | ✗        | `{}`    | Custom metadata                                           |

### Field Data Types

| Type      | Description                                         | Valid Examples                   | Invalid Examples       |
| --------- | --------------------------------------------------- | -------------------------------- | ---------------------- |
| `string`  | Text values (any characters except array delimiter) | `"Hello"`, `"PAT-001234"`, `""`  | N/A (accepts any text) |
| `integer` | Whole numbers only                                  | `42`, `-17`, `0`                 | `3.14`, `1.0`, `2.5`   |
| `number`  | Any numeric value                                   | `42`, `3.14`, `-17.5`, `0`       | `"abc"`, `"N/A"`       |
| `boolean` | True/false (case-insensitive)                       | `true`, `True`, `FALSE`, `false` | `yes`, `1`, `0`, `Y`   |

### Field Restrictions

Field restrictions define validation rules that field values must satisfy to be considered valid. These rules ensure data integrity by enforcing specific constraints on field content.

The `restrictions` property accepts either:

- A single restrictions object
- An array of restrictions objects

When multiple restrictions are provided in an array, they are evaluated sequentially. Data is only considered valid if it passes every restriction in the array.

Each restrictions object can contain:

- **Standard Restrictions** (detailed in the sections below)
- **Conditional restrictions** that apply validation logic based on specific conditions

## Standard Restrictions

### `required`

Ensures a field has a value.

```json showLineNumbers
{
  "name": "patient_id",
  "valueType": "string",
  "restrictions": { "required": true }
}
```

**Validation behavior:**

- Empty strings `""` are rejected
- Zero `0` is accepted for numbers
- `false` is accepted for booleans
- Arrays must contain at least one element

### `codeList`

Restricts values to a predefined list of acceptable options.

```json showLineNumbers
{
  "name": "gender",
  "valueType": "string",
  "restrictions": {
    "codeList": ["Male", "Female", "Other", "Unknown"]
  }
}
```

### `range`

Sets numeric boundaries for `integer` and `number` fields.

```json showLineNumbers
{
  "name": "age",
  "valueType": "integer",
  "restrictions": {
    "range": { "min": 0, "max": 120 }
  }
}
```

**Range options:**

- `min` / `max` - Inclusive boundaries
- `exclusiveMin` / `exclusiveMax` - Exclusive boundaries

```json showLineNumbers
// Age must be 18 or older, but less than 65
{ "range": { "min": 18, "exclusiveMax": 65 } }
```

### `regex`

Applies pattern matching validation to string fields.

```json showLineNumbers
{
  "name": "email",
  "valueType": "string",
  "restrictions": {
    "regex": "^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$"
  }
}
```

### `empty`

Requires a field to be empty. This is typically used within conditional restrictions.

```json showLineNumbers
{
  "restrictions": { "empty": true }
}
```

## Array-Specific Restrictions

### `count`

Controls the number of elements allowed in array fields.

```json showLineNumbers
{
  "name": "medications",
  "valueType": "string",
  "isArray": true,
  "restrictions": {
    "count": { "min": 1, "max": 10 }
  }
}
```

Uses the same boundary options as `range`: `min`, `max`, `exclusiveMin`, `exclusiveMax`.

## Field Comparison Restrictions

### `compare`

Compares field values with other fields in the same record.

```json showLineNumbers
{
  "name": "age_at_death",
  "valueType": "integer",
  "restrictions": {
    "compare": {
      "fields": ["age_at_diagnosis"],
      "relation": "greaterThanOrEqual"
    }
  }
}
```

**Available comparison relations:**

- `equal` / `notEqual` - Value equality comparison
- `greaterThan` / `greaterThanOrEqual` - Numeric comparison
- `lessThan` / `lessThanOrEqual` - Numeric comparison
- `contains` / `containedIn` - String containment comparison

## Conditional Restrictions

Conditional restrictions allow you to apply different validation rules based on values in other fields within the same record. This enables dynamic validation where the requirements for one field change depending on the data in other fields.

Think of conditional restrictions as "if-then-else" logic for your data validation:

- **IF** certain conditions are met in other fields
- **THEN** apply these validation rules
- **ELSE** apply different validation rules (optional)

### Basic Structure

```json showLineNumbers
{
  "if": {
    "conditions": [
      /* conditions to check */
    ],
    "case": "all" // how many conditions must be true
  },
  "then": {
    /* validation rules when conditions are true */
  },
  "else": {
    /* validation rules when conditions are false */
  }
}
```

### Simple Example

Let's start with a straightforward example:

```json showLineNumbers
{
  "name": "date_of_death",
  "valueType": "string",
  "restrictions": {
    "if": {
      "conditions": [
        { "fields": ["patient_status"], "match": { "value": "deceased" } }
      ]
    },
    "then": { "required": true },
    "else": { "empty": true }
  }
}
```

**What this means:**

- **IF** the `patient_status` field equals "deceased"
- **THEN** the `date_of_death` field is required
- **ELSE** the `date_of_death` field must be empty

### Multiple Conditions

When you need to check multiple conditions, use the `case` property to specify how many must be true:

```json showLineNumbers
{
  "name": "treatment_details",
  "valueType": "string",
  "restrictions": {
    "if": {
      "conditions": [
        { "fields": ["patient_status"], "match": { "value": "active" } },
        { "fields": ["enrollment_date"], "match": { "exists": true } }
      ],
      "case": "all"
    },
    "then": { "required": true }
  }
}
```

**What this means:**

- **IF** `patient_status` equals "active" **AND** `enrollment_date` has a value
- **THEN** `treatment_details` is required

### Case Options

| Case Value        | Description                         | Example                                          |
| ----------------- | ----------------------------------- | ------------------------------------------------ |
| `"all"` (default) | All conditions must be true         | Patient must be active AND enrolled              |
| `"any"`           | At least one condition must be true | Patient is active OR has enrollment date         |
| `"none"`          | No conditions can be true           | Patient is NOT active AND has NO enrollment date |

## Building Conditions

Each condition has three parts:

1. **`fields`** - Which fields to check
2. **`match`** - What to look for in those fields
3. **`case`** - How many fields must match (when checking multiple fields)

### Basic Condition Structure

```json showLineNumbers {6-9}
{
  "name": "treatment_details",
  "valueType": "string",
  "restrictions": {
    "if": {
      "conditions": [
        { "fields": ["patient_status"], "match": { "value": "active" } },
        { "fields": ["enrollment_date"], "match": { "exists": true } }
      ],
      "case": "all"
    },
    "then": { "required": true }
  }
}
```

The basic condition structure highlighted above is as follows:

```json showLineNumbers
"conditions": [
  {
    "fields": ["field_name"],
    "match": {
      "value": "specific_value"
    }
  }
],
```

### Checking Multiple Fields

```json showLineNumbers
{
  "fields": ["field1", "field2", "field3"],
  "match": { "value": "active" },
  "case": "any" // at least one field must equal "active"
}
```

### Match Criteria

The `match` object defines what you're looking for. Here are the available options:

### Exact Value Match

```json showLineNumbers
{
  "fields": ["treatment_arm"],
  "match": { "value": "Treatment_A" }
}
```

### Value from List

```json showLineNumbers
{
  "fields": ["disease_stage"],
  "match": { "codeList": ["Stage_III", "Stage_IV"] }
}
```

### Numeric Range

```json showLineNumbers
{
  "fields": ["age"],
  "match": { "range": { "min": 18, "max": 65 } }
}
```

### Pattern Matching

```json showLineNumbers
{
  "fields": ["patient_id"],
  "match": { "regex": "^PAT-\\d{6}$" }
}
```

### Field Has Value

```json showLineNumbers
{
  "fields": ["consent_date"],
  "match": { "exists": true }
}
```

### Array Length

```json showLineNumbers
{
  "fields": ["medications"],
  "match": { "count": { "min": 1 } }
}
```

```json showLineNumbers
{
  "name": "sociodem_question_detail",
  "valueType": "string",
  "restrictions": {
    "if": {
      "conditions": [
        {
          "fields": ["sociodem_question"],
          "match": {
            "codeList": ["PCGL reference question", "Another question"]
          },
          "case": "any"
        }
      ]
    },
    "then": { "required": true },
    "else": {
      "required": false,
      "empty": true
    }
  }
}
```

### Working with Arrays

When checking array fields, use `arrayFieldCase` to specify how many array elements must match:

```json showLineNumbers
{
  "name": "diabetes_medication",
  "valueType": "string",
  "restrictions": {
    "if": {
      "conditions": [
        {
          "fields": ["medical_history"],
          "match": { "value": "diabetes" },
          "arrayFieldCase": "any" // any element in the array can match
        }
      ]
    },
    "then": { "required": true }
  }
}
```

### Array Field Case Options

| Value    | Description                          |
| -------- | ------------------------------------ |
| `"all"`  | All elements in the array must match |
| `"any"`  | At least one element must match      |
| `"none"` | No elements can match                |

### Complex Conditional Logic

You can combine multiple conditions with different logic:

```json showLineNumbers
{
  "name": "follow_up_required",
  "valueType": "boolean",
  "restrictions": {
    "if": {
      "conditions": [
        {
          "fields": ["treatment_response"],
          "match": { "codeList": ["partial_response", "stable_disease"] }
        },
        { "fields": ["adverse_events"], "match": { "count": { "min": 1 } } }
      ],
      "case": "any" // either condition can trigger the requirement
    },
    "then": { "required": true }
  }
}
```

## Source Code Reference

Source code for the Lectern Dictionary meta-schema is available through the package [@overture-stack/lectern-dictionary](../packages/dictionary/). The meta-schema is formally defined in TypeScript and exported as the type `Dictionary` from [`dictionary/src/types/dictionaryTypes.ts`](../packages/dictionary/src/types/dictionaryTypes.ts). This definition uses [Zod](https://zod.dev/) schemas, which are also exported for validation purposes.

:::info Need Help?
If you encounter any issues or have questions about our API, please don't hesitate to reach out through our relevant [**community support channels**](https://docs.overture.bio/community/support).
:::
