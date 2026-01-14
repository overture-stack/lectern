# Building Dictionaries

A Lectern Dictionary is a JSON configuration that defines the structure and validation rules for tabular data files. It consists of schemas that describe individual file formats, with each schema containing field definitions and validation constraints.

## Dictionary Structure

A Lectern Dictionary is a JSON configuration file that defines the structure and validation rules for your data files. At its core, every dictionary must contain three essential components: a **name**, **version**, and **schemas**.

```json showLineNumbers {2-3,9-11}
{
  "name": "clinical_data_dictionary",
  "version": "1.2.0",
  "description": "Clinical trial data collection schemas",
  "meta": {
    "author": "Clinical Data Team",
    "created": "2024-01-15"
  },
  "schemas": [
    { ... }
  ],
  "references": {
    "regex": {
      "patient_id_format": "^PAT-\\d{6}$",
    }
  }
}
```

Optional components like descriptions, metadata, and references which can also be used are described in the table below.

#### Dictionary Properties

| Property      | Type     | Required | Description                            | Example                                   |
| ------------- | -------- | -------- | -------------------------------------- | ----------------------------------------- |
| `name`        | `string` | ✓        | Name of the dictionary                 | `"clinical_data_dictionary"`              |
| `version`     | `string` | ✓        | Semantic version (major.minor.patch)   | `"1.2.0"`                                 |
| `schemas`     | `Array`  | ✓        | List of schema definitions (minimum 1) | See [Schema Structure](#schema-structure) |
| `description` | `string` | ✗        | A human-readable description           | `"Clinical trial data schemas"`           |
| `displayName` | `string` | ✗        | Display name of the dictionary         | `"Clinical Data Dictionary"`              |
| `meta`        | `object` | ✗        | Any custom defined metadata fields     | `{"author": "Clinical Data Team"}`        |
| `references`  | `object` | ✗        | Reusable reference values              | See [References](#references)             |

## Schema Structure

Each **schema** defines the structure of a single tabular data file. Every dictionary must have a **name** field and **fields** array.

```json showLineNumbers {9-24}
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
      "name": "patientSchema",
      "description": "Patient demographic and clinical information",
      "fields": [
        { ... },
      ],
    },
    {
      "name": "sampleSchema",
      "description": "Data derived from patient samples",
      "fields": [
        { ... },
      ],
    }
  ]
}
```

At the schema-level descriptions and metadata can also be optionally added.

#### Schema Properties

| Property      | Type     | Required | Description                                                                                  |
| ------------- | -------- | -------- | -------------------------------------------------------------------------------------------- |
| `name`        | `string` | ✓        | The schema identifier. Typically a short name with no spaces. Cannot contain `.` characters. |
| `displayName` | `string` | ✗        | A human-readable name for UI display. No format restrictions.                                |
| `fields`      | `Array`  | ✓        | List of field definitions, see [Field Structure](#field-structure)                           |
| `description` | `string` | ✗        | A human-readable description                                                                 |
| `meta`        | `object` | ✗        | Any custom defined metadata fields                                                           |

## Field Structure

**Fields** define the individual columns in your data files, at minimum a field object must have a **name** and **valueType**.

```json showLineNumbers {13-32}
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
          "restrictions": { ... },
        }
        {
          "name": "field2",
          "valueType": "boolean",
        },
        {
          "name": "field3",
          "valueType": "integer",
        },
        {
          "name": "field4",
          "valueType": "number",
        },
      ]
    }
  ],
}
```

#### Field Value Types

The allowed values for `valueType` include:

| Type      | Description                                         | Valid Examples                   | Invalid Examples       |
| --------- | --------------------------------------------------- | -------------------------------- | ---------------------- |
| `string`  | Text values (any characters except array delimiter) | `"Hello"`, `"PAT-001234"`, `""`  | N/A (accepts any text) |
| `integer` | Whole numbers only                                  | `42`, `-17`, `0`                 | `3.14`, `1.0`, `2.5`   |
| `number`  | Any numeric value                                   | `42`, `3.14`, `-17.5`, `0`       | `"abc"`, `"N/A"`       |
| `boolean` | True/false (case-insensitive)                       | `true`, `True`, `FALSE`, `false` | `yes`, `1`, `0`, `Y`   |

#### Field Properties

At the field-level the following properties can also be included:

| Property       | Type           | Required | Default | Description                                                                                                       |
| -------------- | -------------- | -------- | ------- | ----------------------------------------------------------------------------------------------------------------- |
| `name`         | `string`       | ✓        | -       | Field identifier (used as a column header). Typically a short name with no spaces. Cannot contain `.` characters. |
| `displayName`  | `string`       | ✗        | -       | A human-readable name for UI display. Can contain periods.                                                        |
| `description`  | `string`       | ✗        | `""`    | Human-readable description                                                                                        |
| `valueType`    | `string`       | ✓        | -       | Data type: `string`, `integer`, `number`, `boolean`                                                               |
| `isArray`      | `boolean`      | ✗        | `false` | Whether field accepts multiple values                                                                             |
| `delimiter`    | `string`       | ✗        | `","`   | Separator for array values                                                                                        |
| `unique`       | `boolean`      | ✗        | `false` | Whether values must be unique across records                                                                      |
| `restrictions` | `object/array` | ✗        | `{}`    | Where the validation rules/logic for the field is defined, see [Field Restrictions](#field-restrictions)          |
| `meta`         | `object`       | ✗        | `{}`    | Any custom defined metadata fields                                                                                |

### Display Name Example

The `displayName` property allows for more user-friendly names in UIs while maintaining technical compatibility with the restricted `name` property:

````json
{
  "name": "patient_schema",
  "displayName": "Patient Information",
  "fields": [
    {
      "name": "patient_id",
      "displayName": "Patient ID Number",
      "valueType": "string"
    },
    {
      "name": "dob",
      "displayName": "Date of Birth",
      "valueType": "string"
    },
    {
      "name": "disease_stage",
      "displayName": "Disease Stage (I-IV)",
      "valueType": "string"
    }
  ]
}

## Field Restrictions

Field restrictions define the rules that field values must satisfy to be considered valid. Here's an example of a field that defines and validates the age of a patient:

```json
{
  "name": "patient_age",
  "valueType": "integer",
  "restrictions": {
    "required": true,
    "range": {
      "min": 0,
      "max": 150
    }
  }
}
````

:::note What this means:
Age must be provided and must be between 0-150 years old.
:::

Each restrictions object can contain:

- **Standard Restrictions** (detailed in the sections below)
- **Conditional restrictions** that apply validation logic based on specific [`conditions`](#conditions)

### `required`

Ensures a field has a value.

```json showLineNumbers
{
	"name": "patient_id",
	"valueType": "string",
	"restrictions": { "required": true }
}
```

### `codeList`

Restricts values to a predefined list of acceptable options.

```json showLineNumbers
{
	"name": "treatment_response",
	"valueType": "string",
	"restrictions": {
		"codeList": ["Complete Response", "Partial Response", "Stable Disease", "Progressive Disease"]
	}
}
```

:::note **What this means:**
The `treatment_response` field will only accept values that exactly match one of the four options in the list. Any other value will be rejected.
:::

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
{
	"name": "adult_age",
	"valueType": "integer",
	"restrictions": {
		"range": { "min": 18, "exclusiveMax": 65 }
	}
}
```

:::note **What this means:**
Age must be 18 or older (inclusive), but less than 65 (exclusive). So valid values are 18-64.
:::

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

For human readability we recommend using the `description` property and creating a `meta` property `examples` to clearly document the regex restriction.

```json showLineNumbers
{
	"name": "email",
	"valueType": "string",
	"description": "Contact email address for patient communication and records. Valid email format: username@domain.extension (minimum 2-letter extension). Accepts letters, numbers, dots, hyphens, and underscores in username and domain.",
	"restrictions": {
		"required": true,
		"regex": "^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$"
	},
	"meta": {
		"examples": ["patient@example.com", "john.doe@hospital.org", "contact123@healthcare.gov"]
	}
}
```

:::note **What this means:**
Email address must be provided and follow standard email format with a username, @ symbol, domain name, and valid extension. The examples show acceptable formats while the pattern description explains what characters are allowed.
:::

### `count`

Count is an **array specific** condition that controls the number of elements allowed in array fields.

```json showLineNumbers {4,6}
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

:::note **What this means:**
The medications array must contain between 1 and 10 medication entries. Empty arrays or arrays with more than 10 items will be rejected.
:::

### `empty`

Requires a field to have no value.

```json showLineNumbers
{
	"name": "date_of_death",
	"valueType": "string",
	"restrictions": { "empty": true }
}
```

:::note **What this means:**
The field must have no value - only empty strings, null, or undefined values are accepted. Any actual content will be rejected.
:::

<details>
<summary>**Here is a more practical example using conditional logic**</summary>

The `empty` restriction becomes particularly useful when combined with [conditional restrictions](#conditions) to create logical data rules:

```json showLineNumbers
{
	"name": "date_of_death",
	"valueType": "string",
	"restrictions": {
		"if": {
			"conditions": [{ "fields": ["patient_status"], "match": { "value": "alive" } }]
		},
		"then": { "empty": true },
		"else": { "required": true }
	}
}
```

**What this means:** If the patient status is "alive", then the date of death field must be empty. If the patient status is anything other than "alive", then the date of death field is required.

</details>

### `conditions`

Conditional restrictions allow you to apply different validation rules based on the values in other fields. This enables more complex validation rules where the requirements for one field change depending on the data in other fields.

Think of conditional restrictions as "if-then-else" logic for your data validation:

- **IF** certain conditions are met in other fields
- **THEN** apply these validation rules
- **ELSE** apply different validation rules (optional)

#### Basic Structure

```json showLineNumbers
"restrictions": {
  "if": {
    "conditions": [
      /* conditions to check */
    ],
  },
  "then": {
    /* validation rules when conditions are true */
  },
  "else": {
    /* validation rules when conditions are false */
  }
}
```

**Match Criteria**

The `match` object defines what you're looking for:

```json showLineNumbers
// Exact value
{ "match": { "value": "Treatment_A" } }

// Value from list
{ "match": { "codeList": ["Stage_III", "Stage_IV"] } }

// Numeric range
{ "match": { "range": { "min": 18, "max": 65 } } }

// Pattern matching
{ "match": { "regex": "^PAT-\\d{6}$" } }

// Field has any value
{ "match": { "exists": true } }

// Array length
{ "match": { "count": { "min": 1 } } }
```

#### Simple Example

```json showLineNumbers
{
	"name": "date_of_death",
	"valueType": "string",
	"restrictions": {
		"if": {
			"conditions": [{ "fields": ["patient_status"], "match": { "value": "deceased" } }]
		},
		"then": { "required": true },
		"else": { "empty": true }
	}
}
```

:::note **What this means:**
If the `patient_status` field equals "deceased", then the `date_of_death` field is required. Otherwise, the `date_of_death` field must be empty.
:::

#### Case Logic

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

:::note **What this means:**
If `patient_status` equals "active" AND `enrollment_date` has a value, then `treatment_details` is required.
:::

**Case Options:**

| Case Value        | Description                         | Example                                          |
| ----------------- | ----------------------------------- | ------------------------------------------------ |
| `"all"` (default) | All conditions must be true         | Patient must be active AND enrolled              |
| `"any"`           | At least one condition must be true | Patient is active OR has enrollment date         |
| `"none"`          | No conditions can be true           | Patient is NOT active AND has NO enrollment date |

**Working with Arrays**

When checking array fields, use `arrayFieldCase` to specify how many array elements must match. Here's a practical example using a medications field:

```json showLineNumbers {10}
{
	"name": "follow_up_required",
	"valueType": "boolean",
	"restrictions": {
		"if": {
			"conditions": [
				{
					"fields": ["current_medications"],
					"match": {
						"codeList": ["chemotherapy", "immunotherapy", "targeted_therapy"]
					},
					"arrayFieldCase": "any"
				}
			]
		},
		"then": { "required": true }
	}
}
```

:::note **What this means:**
If the patient is taking ANY cancer treatment medication (chemotherapy, immunotherapy, or targeted therapy) in their medications array, then follow-up is required.
:::

**Array Field Case Options:**

| Value    | Description                          | Example Use Case                              |
| -------- | ------------------------------------ | --------------------------------------------- |
| `"all"`  | All elements in the array must match | All medications must be from an approved list |
| `"any"`  | At least one element must match      | Patient has at least one high-risk medication |
| `"none"` | No elements can match                | Patient cannot have any contraindicated drugs |

**Additional Array Examples:**

```json showLineNumbers
// Example: All medications must be FDA approved
{
  "fields": ["medications"],
  "match": { "regex": "^FDA-\\d+" },
  "arrayFieldCase": "all"
}

// Example: Patient cannot have any experimental drugs
{
  "fields": ["medications"],
  "match": { "codeList": ["experimental_drug_A", "experimental_drug_B"] },
  "arrayFieldCase": "none"
}
```

#### Complex Example

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
				{
					"fields": ["adverse_events"],
					"match": { "count": { "min": 1 } }
				}
			],
			"case": "any" // either condition can trigger the requirement
		},
		"then": { "required": true }
	}
}
```

:::note **What this means:**
If the treatment response is "partial_response" OR "stable_disease", OR if there's at least one adverse event, then follow-up is required.
:::

## Schema Restrictions

In addition to field-level restrictions, Lectern Dictionaries support schema-level restrictions that establish relationships between schemas.

### `uniqueKey`

Primary keys identify unique records within a schema using the `uniqueKey` restriction applied at the schema level. They ensure that each record can be distinctly identified by one or more field values.

#### Single Field Primary Key

```json showLineNumbers {18-20}
{
	"schemas": [
		{
			"name": "participant",
			"description": "The collection of all data related to a specific individual",
			"fields": [
				{
					"name": "submitter_participant_id",
					"description": "Unique identifier of the participant within the study, assigned by the data provider",
					"valueType": "string",
					"restrictions": {
						"required": true,
						"regex": "^[A-Za-z0-9\\-\\._]{1,64}$"
					},
					"unique": true
				}
			],
			"restrictions": {
				"uniqueKey": ["submitter_participant_id"]
			}
		}
	]
}
```

:::note **What this means:**
Each `submitter_participant_id` value must be unique across all records in the participant schema - no two participants can have the same ID.
:::

#### Compound Primary Key

For cases where uniqueness requires multiple field combinations:

```json showLineNumbers {24-26}
{
	"schemas": [
		{
			"name": "patient_visit",
			"description": "Patient visits identified by participant and visit number",
			"fields": [
				{
					"name": "submitter_participant_id",
					"valueType": "string",
					"restrictions": {
						"required": true,
						"regex": "^[A-Za-z0-9\\-\\._]{1,64}$"
					}
				},
				{
					"name": "visit_number",
					"valueType": "integer",
					"restrictions": {
						"required": true,
						"range": { "min": 1 }
					}
				}
			],
			"restrictions": {
				"uniqueKey": ["submitter_participant_id", "visit_number"]
			}
		}
	]
}
```

:::note **What this means:**
The combination of `submitter_participant_id` and `visit_number` must be unique. A participant can have multiple visits, and visit numbers can repeat across participants, but the same participant cannot have duplicate visit numbers.
:::

### `foreignKey`

Foreign keys establish relationships between schemas by referencing primary keys in other schemas. They ensure referential integrity by validating that referenced records actually exist.

#### Basic Foreign Key

```json showLineNumbers {37-47}
{
	"schemas": [
		{
			"name": "participant",
			"description": "Study participants",
			"fields": [
				{
					"name": "submitter_participant_id",
					"description": "Unique identifier of the participant within the study",
					"valueType": "string",
					"restrictions": {
						"required": true,
						"regex": "^[A-Za-z0-9\\-\\._]{1,64}$"
					},
					"unique": true
				}
			],
			"restrictions": {
				"uniqueKey": ["submitter_participant_id"]
			}
		},
		{
			"name": "sociodemographic",
			"description": "Captures sociodemographic characteristics",
			"fields": [
				{
					"name": "submitter_participant_id",
					"description": "Unique identifier of the participant within the study, assigned by the data provider",
					"valueType": "string",
					"restrictions": {
						"required": true,
						"regex": "^[A-Za-z0-9\\-\\._]{1,64}$"
					}
				}
			],
			"restrictions": {
				"foreignKey": [
					{
						"schema": "participant",
						"mappings": [
							{
								"local": "submitter_participant_id",
								"foreign": "submitter_participant_id"
							}
						]
					}
				]
			}
		}
	]
}
```

:::note **What this means:**
Every `submitter_participant_id` in the sociodemographic schema must match an existing `submitter_participant_id` in the participant schema. You cannot create sociodemographic records for participants that don't exist.
:::

#### Foreign Key Properties

| Property   | Type                   | Required | Description                             |
| ---------- | ---------------------- | -------- | --------------------------------------- |
| `schema`   | `string`               | ✓        | Name of the referenced schema           |
| `mappings` | `Array<MappingObject>` | ✓        | Array of field mappings between schemas |

#### Mapping Object Properties

| Property  | Type     | Required | Description                         |
| --------- | -------- | -------- | ----------------------------------- |
| `local`   | `string` | ✓        | Field name in the current schema    |
| `foreign` | `string` | ✓        | Field name in the referenced schema |

#### Validation Rules

Foreign key validation enforces these requirements:

- **Referenced schema** must exist in the same dictionary
- **Referenced fields** must be defined as a `uniqueKey` in the target schema
- **Foreign key values** must match existing primary key values in the referenced schema
- **Local fields** referenced in mappings must exist in the current schema

#### Multiple Foreign Keys

A schema can reference multiple other schemas to create complex relationships:

<details>
<summary>**Click here to view the example schema**</summary>
```json showLineNumbers {18,45-56,93-113}
{
  "schemas": [
    {
      "name": "participant",
      "description": "Study participants",
      "fields": [
        {
          "name": "submitter_participant_id",
          "valueType": "string",
          "restrictions": {
            "required": true,
            "regex": "^[A-Za-z0-9\\-\\._]{1,64}$"
          },
          "unique": true
        }
      ],
      "restrictions": {
        "uniqueKey": ["submitter_participant_id"]
      }
    },
    {
      "name": "diagnosis",
      "description": "Medical diagnoses for participants",
      "fields": [
        {
          "name": "submitter_diagnosis_id",
          "valueType": "string",
          "restrictions": {
            "required": true,
            "regex": "^[A-Za-z0-9\\-\\._]{1,64}$"
          },
          "unique": true
        },
        {
          "name": "submitter_participant_id",
          "description": "Unique identifier of the participant within the study",
          "valueType": "string",
          "restrictions": {
            "required": true,
            "regex": "^[A-Za-z0-9\\-\\._]{1,64}$"
          }
        }
      ],
      "restrictions": {
        "uniqueKey": ["submitter_diagnosis_id"],
        "foreignKey": [
          {
            "schema": "participant",
            "mappings": [
              {
                "local": "submitter_participant_id",
                "foreign": "submitter_participant_id"
              }
            ]
          }
        ]
      }
    },
    {
      "name": "treatment",
      "description": "Medications, procedures, other actions taken for clinical management",
      "fields": [
        {
          "name": "submitter_treatment_id",
          "description": "Unique identifier of the treatment, assigned by the data provider",
          "valueType": "string",
          "restrictions": {
            "required": true,
            "regex": "^[A-Za-z0-9\\-\\._]{1,64}$"
          },
          "unique": true
        },
        {
          "name": "submitter_diagnosis_id",
          "description": "Unique identifier of the primary diagnosis event, assigned by the data provider",
          "valueType": "string",
          "restrictions": {
            "required": true,
            "regex": "^[A-Za-z0-9\\-\\._]{1,64}$"
          }
        },
        {
          "name": "submitter_participant_id",
          "description": "Unique identifier of the participant within the study, assigned by the data provider",
          "valueType": "string",
          "restrictions": {
            "required": true,
            "regex": "^[A-Za-z0-9\\-\\._]{1,64}$"
          }
        }
      ],
      "restrictions": {
        "uniqueKey": ["submitter_treatment_id"],
        "foreignKey": [
          {
            "schema": "diagnosis",
            "mappings": [
              {
                "local": "submitter_diagnosis_id",
                "foreign": "submitter_diagnosis_id"
              }
            ]
          },
          {
            "schema": "participant",
            "mappings": [
              {
                "local": "submitter_participant_id",
                "foreign": "submitter_participant_id"
              }
            ]
          }
        ]
      }
    }
  ]
}
```

</details>

:::note **What this means:**
In the example above each treatment record must reference both an existing diagnosis and an existing participant. This creates a hierarchical relationship: participant → diagnosis → treatment.
:::

#### Complete Schema Relationship Example

Here's how primary and foreign keys work together to create a complete data model:

```json showLineNumbers
{
	"name": "clinical_dictionary",
	"version": "1.0.0",
	"schemas": [
		{
			"name": "participant",
			"description": "Study participants",
			"fields": [
				{
					"name": "submitter_participant_id",
					"description": "Unique identifier of the participant within the study",
					"valueType": "string",
					"restrictions": {
						"required": true,
						"regex": "^[A-Za-z0-9\\-\\._]{1,64}$"
					},
					"unique": true
				}
			],
			"restrictions": {
				"uniqueKey": ["submitter_participant_id"]
			}
		},
		{
			"name": "diagnosis",
			"description": "Medical diagnoses for participants",
			"fields": [
				{
					"name": "submitter_diagnosis_id",
					"description": "Unique identifier of the primary diagnosis event",
					"valueType": "string",
					"restrictions": {
						"required": true,
						"regex": "^[A-Za-z0-9\\-\\._]{1,64}$"
					},
					"unique": true
				},
				{
					"name": "submitter_participant_id",
					"description": "Unique identifier of the participant within the study",
					"valueType": "string",
					"restrictions": {
						"required": true,
						"regex": "^[A-Za-z0-9\\-\\._]{1,64}$"
					}
				}
			],
			"restrictions": {
				"uniqueKey": ["submitter_diagnosis_id"],
				"foreignKey": [
					{
						"schema": "participant",
						"mappings": [
							{
								"local": "submitter_participant_id",
								"foreign": "submitter_participant_id"
							}
						]
					}
				]
			}
		}
	]
}
```

:::note **What this relationship creates:**

- **Participants** have unique IDs (primary key)
- **Diagnoses** have unique IDs (primary key)
- **Each diagnosis** must belong to an existing participant (foreign key)
- **Result**: A one-to-many relationship where one participant can have multiple diagnoses
  :::

## References

The `references` section is a **dictionary-level** property that allows you to define reusable values that can be referenced throughout your entire dictionary within all schemas. This is particularly useful for common regular expressions, shared code lists, or other values that appear in multiple places across different schemas. `references` are defined once at the dictionary level and can be used in any schema within the dictionary.

```json showLineNumbers {39-47}
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
			"fields": [
				{
					"name": "bioproject_accession",
					"valueType": "string",
					"restrictions": {
						"regex": "#/regex/BioProject_accession"
					}
				},
				{
					"name": "diagnosis_date",
					"valueType": "string",
					"restrictions": {
						"required": true,
						"regex": "#/regex/date"
					}
				},
				{
					"name": "country",
					"valueType": "string",
					"restrictions": {
						"required": true,
						"codeList": "#/list/geo_loc_name_country"
					}
				}
			]
		}
	],
	"references": {
		"regex": {
			"BioProject_accession": "^PRJN[A-Z0-9]+$",
			"date": "^\\d{4}-\\d{2}-\\d{2}$"
		},
		"list": {
			"geo_loc_name_country": ["Canada", "United States", "Mexico", "..."]
		}
	}
}
```

:::info **Need Help?**
If you encounter any issues or have questions, please don't hesitate to reach out through our relevant [**community support channels**](https://docs.overture.bio/community/support).
:::
