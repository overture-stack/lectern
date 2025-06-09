# Lectern Client - REST API

The lectern client exports a set of functions to make requests to a Lectern Server REST API. This is exported in a property named `rest`.

```ts
import * as lectern from '@overture-stack/lecter-client';

const dictionaryList = await lectern.rest.getDictionaries('http://lectern.example.com');
```

All functions in the REST API take the lectern host URL as the first argument, and typically have the required properties entered into an object in the second argument, and an object with optional properties as the third argument. Each then return a `Result` which contains the requested data on success.

## Functions

| Function                              | Lectern Server REST API                                                          | Description                                                                                                     |
| ------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| [listDictionaries](#listdictionaries) | `GET /dictionaries`                                                              | Fetch a list of all dictionaries available on the Lectern server.                                               |
| [getDictionary](#getDictionary)       | `GET /dictionaries/{id}` <br/> `GET /dictionaries?name={name}&version={version}` | Fetch the contents of a single dictionary. This can be done by dictionary ID, or by dictonary name and version. |
| [getDiff](#getDiff)                   | `GET /diff`                                                                      | Fetch the differences between two versions of the same dictionary.                                              |

### `listDictionaries()`

List all dictionaries from Lectern Server. Optionally, the a dictionary name can be provided to filter the list to only dictionaries of the given name.

#### Options

- `name?: string` - Provide a name to filter list to only versions of the dictionary with the given name.

#### Returns

Returns an array with all Dictionaries that match the query. This is all dictionaries if no filters are provided, or the subset of dictionaries that match the provided dictionary name. Each entry in this array contains a subset of the dictionary fields.

| Field       | Type   | Description                                                                                                                  |
| ----------- | ------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `_id`       | string | Internal ID for this dictionary. This is useful when requesting a dictionary by ID, for example with `rest.getDictionary()`. |
| `name`      | string | Name of the dictionary.                                                                                                      |
| `version`   | string | Version of the dictionary.                                                                                                   |
| `createdAt` | Date   | When this version of the dictionary was created.                                                                             |

```ts
type DictionarySummary = {
	_id: string,
	name: string,
	version: string,
	createdAt: Date
}
```

```json
[
	{
		"_id": "678e62971a9a67cacd8f4325",
		"name": "example_dictionary",
		"version": "1.0",
		"createdAt": "2025-05-29T07:00:00.0000"
	},
	{
		"_id": "678e63f91a9a67cacd8f4328",
		"name": "example_dictionary",
		"version": "1.1",
		"createdAt": "2025-05-30T215:00:00.0000",
	},
	{
		"_id": "678e6bdd1a9a67cacd8f432d",
		"name": "example_dictionary",
		"version": "1.2",
		"createdAt": "2025-05-31T23:00:00.0000"
	}
]
```

#### Examples

All Dictionaries:

```ts
const dictionariesResult = await lectern.rest.listDictionaries(lecternUrl);

if(dictionariesResult.success) {
	dictionariesResult.data.forEach((dictionarySummary) => {
		// ...
	})
}
```

Filtered by dictionary name:
```ts
const dictionariesResult = await lectern.rest.listDictionaries(lecternUrl, { name: 'important-data-dictionary' });
```


### `getDictionary()`

#### Examples
By ID:

```ts
const dictionaryId = '660c583ec7e3a638393ac462';

const dictionariesResult = await lectern.rest.listDictionaries(lecternUrl, dictionaryId)
```

### `getDiff()`

#### Parameters

#### Options

#### Returns

The return type is the `DictionaryDiffArray` exported from `@overture-stack/lectern-dictionary`.

It consists of a 2 element tuple of the form `["{schema}.{field}", {left: {...}, right: {...}, diff: {...}}]`.

The first element is a string identifying a field from a schema that has changes between the two versions.

The second element is an object that contains the field definition from the `left` version dictionary, the field defintiion from the `right` version dictionary, and a `diff` object that identifies what has changed between the two.

```json
[
  [
    "sample.organism",
    {
      "left": {
        "name": "organism",
        "description": "Taxonomic name of the organism.",
        "meta": {
          "displayName": "organism",
          "examples": "Severe acute respiratory syndrome coronavirus 2",
          "notes": "Provide the official nomenclature for the organism present in the sample. Search for taxonomic names here: ncbi.nlm.nih.gov/taxonomy."
        },
        "valueType": "string",
        "restrictions": {
          "codeList": [
            "NCBITaxon:2697049 Severe acute respiratory syndrome coronavirus 2",
            "GENEPIO:0001619 Not Applicable",
            "GENEPIO:0001618 Missing",
            "GENEPIO:0001620 Not Collected",
            "GENEPIO:0001668 Not Provided",
            "GENEPIO:0001810 Restricted Access"
          ],
          "required": true
        }
      },
      "right": {
        "name": "organism",
        "description": "Taxonomic name of the organism.",
        "meta": {
          "displayName": "organism",
          "examples": "Severe acute respiratory syndrome coronavirus 2",
          "notes": "Provide the official nomenclature for the organism present in the sample. Search for taxonomic names here: ncbi.nlm.nih.gov/taxonomy."
        },
        "valueType": "string",
        "restrictions": {
          "codeList": [
            "NCBITaxon:2697049 Severe acute respiratory syndrome coronavirus 2 ,GENEPIO:0001619 Not Applicable,GENEPIO:0001618 Missing,GENEPIO:0001620 Not Collected,GENEPIO:0001668 Not Provided,GENEPIO:0001810 Restricted Access"
          ],
          "required": true
        }
      },
      "diff": {
        "restrictions": {
          "codeList": {
            "type": "updated",
            "data": {
              "added": [
                "NCBITaxon:2697049 Severe acute respiratory syndrome coronavirus 2 ,GENEPIO:0001619 Not Applicable,GENEPIO:0001618 Missing,GENEPIO:0001620 Not Collected,GENEPIO:0001668 Not Provided,GENEPIO:0001810 Restricted Access"
              ],
              "deleted": [
                "NCBITaxon:2697049 Severe acute respiratory syndrome coronavirus 2",
                "GENEPIO:0001619 Not Applicable",
                "GENEPIO:0001618 Missing",
                "GENEPIO:0001620 Not Collected",
                "GENEPIO:0001668 Not Provided",
                "GENEPIO:0001810 Restricted Access"
              ]
            }
          }
        }
      }
    }
  ]
]
```

#### Examples


