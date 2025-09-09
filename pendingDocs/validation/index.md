# Validating Data with Lectern

- Uses validation library
  - Available through:
    - Lectern client NPM package
    - Lectern server via web request (pending)
- Can validate entire data sets, or subsets of the data. These Different validations apply subsets of the dictionary restrictions based on the amount of data provided.
  - Individual field from a single data record vs Field
    - Includes all field level restrictions and data value type checking
    - Can be provided Data Record information to resolve conditional restrictions.
  - Single data record vs Schema
    - Includes all field level restricitons for every field in the record
    - Always resolves conditional restrictions
    - Includes check for unrecognized fields
  - Data of a single entity type vs Schema
    - includes unique and uniqueKey restrictions
  - Entire dataset vs Dictionary
    - inlude foreignKey restrictions