# Validation Reports

## Restriction Levels
Restrictions apply to multiple different levels, differentiated by what data is needed to check their rules.


#### Dictionary
Considers all records for all schemas of the dictionary.

- ForeignKey
- schemaNames (look at schemas provided in a data set, flag any that have an invalid name)

#### Schema
Considers all records for a given schema.

- unique
- uniqueKey

#### Record
Considers all fields within a single data record.

- fieldName
- compare

Note: It is at this level that conditional restrictions are calculated.

#### Field
Considers only the value of the given field
- codeList
- range
- required
- empty
- count

## Handling Singular and Array Fields

Field level validations have a complication where sometimes the field has an array of values. When this is the case, we need to still report the validation error using the same object, but we will need to provide additional details to indicate which element(s) in the array caused the failure.

Let's use a `codelist` restriction as an example: `"codeList": ["good", "ok", "fine"]`

Consider a sample schema:

```json
{
	"name": "array-vs-single-example",
	"description": "Includes one two fields both restricted to a list of values. One field is an array.",
	"fields": [
		{
			"name": "singule_value_field",
			"valueType": "string",
			"restrictions": {
				"codeList": ["good", "ok", "fine"]
			}
		},
		{
			"name": "array_value_field",
			"valueType": "string",
			"isArray": true,
			"restrictions": {
				"codeList": ["good", "ok", "fine"]
			}
		}
	]
}
```

Let's look at what the errors would look like for the following records:

```json
{
	"single_value_field": "bad",
	"array_value_field": ["good", "wrong", "fine"]
}
```

When this record is validated we should get back the following report:

```json
[
	{
		"field": "single_value_field",
		"value": "bad",
		"errors": [{
			"message": "The value for this field must match an option from the list.",
			"restriction": {
				"type": "codeList",
				"rule": ["good", "ok", "fine"],
			},
		}, {
		"field": "array_value_field",
		"value": ["good", "wrong", "fine"],
		"errors": [{
			"message": "All values for this field must match an option from the list.",
			"restriction": {
				"type": "codeList",
				"rule": ["good", "ok", "fine"],
			},
			"invalidItems": [
				{
					"position": 1,
					"value": "wrong"
				}
			]
		}]
	}
]
```