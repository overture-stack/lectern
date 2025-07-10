# Record Validation

This process validates a single [data record](../important-concepts.md/#datarecord) using a [Schema](../important-concepts.md#schema) definition. This will check each field in the record against the field definition from the schema. he outcome of a Record validation test will then be a [`TestResult`](./important-concepts.md#testresult) that if invalid will contain an array of type `RecordValidationError` that contains all the [reasons why the validation failed](#record-validation-failure-reasons). 

## Record Validation Failure Reasons

Record validation has only a single failure case which occurs if one or more of the field values in the data record are invalid. Therefore the information provided to an invalid Record validation test is an array of errors for each field that failed validation. Each of these errors are an object that will have a `reason` property to indicate the source of the error:

1. `INVALID_FIELD_VALUE`: The field is defined in the schema and the value was tested and found to be in error. The causes for this validation failure are defined in [`Field Validation Error Reasons`](./field-validation.md#field-validation-failure-reasons).
2. `UNRECOGNIZED_FIELD`: The field in the record is not found in the Schema definition, therefore it should not be in this data record. There is no additional information given other than the name of the field.