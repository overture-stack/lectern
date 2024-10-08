import { Dictionary } from '@overture-stack/lectern-dictionary';

const dictionary: Dictionary = {
	schemas: [
		{
			name: 'registration',
			description: 'TSV for Registration of Donor-Specimen-Sample',
			fields: [
				{
					name: 'program_id',
					valueType: 'string',
					description: 'Unique identifier for program',
					meta: {
						key: true,
						examples: 'PACA-CA, BASHAR-LA',
					},
					restrictions: {
						required: true,
						regex: '^[A-Z1-9][-_A-Z1-9]{2,7}(-[A-Z][A-Z])$',
					},
				},
				{
					name: 'submitter_donor_id',
					valueType: 'string',
					description: 'Unique identifier for donor, assigned by the data provider.',
					meta: {
						key: true,
					},
					restrictions: {
						required: true,
						regex: '^(?!(DO|do)).+',
					},
				},
				{
					name: 'gender',
					valueType: 'string',
					description: 'The gender of the patient',
					meta: {
						default: 'Other',
					},
					restrictions: {
						required: true,
						codeList: ['Male', 'Female', 'Other'],
					},
				},
				{
					name: 'submitter_specimen_id',
					valueType: 'string',
					description: 'Submitter assigned specimen id',
					meta: {
						key: true,
					},
					restrictions: {
						required: true,
						regex: '^(?!(SP|sp)).+',
					},
				},
				{
					name: 'specimen_type',
					valueType: 'string',
					description: 'Indicate the tissue source of the biospecimen',
					meta: {
						default: 'Other',
					},
					restrictions: {
						required: true,
						codeList: [
							'Blood derived',
							'Blood derived - bone marrow',
							'Blood derived - peripheral blood',
							'Bone marrow',
							'Buccal cell',
							'Lymph node',
							'Solid tissue',
							'Plasma',
							'Serum',
							'Urine',
							'Cerebrospinal fluid',
							'Sputum',
							'NOS (Not otherwise specified)',
							'Other',
							'FFPE',
							'Pleural effusion',
							'Mononuclear cells from bone marrow',
							'Saliva',
							'Skin',
						],
					},
				},
				{
					name: 'tumour_normal_designation',
					valueType: 'string',
					description: 'Indicate whether specimen is tumour or normal type',
					restrictions: {
						required: true,
						codeList: [
							'Normal',
							'Normal - tissue adjacent to primary tumour',
							'Primary tumour',
							'Primary tumour - adjacent to normal',
							'Primary tumour - additional new primary',
							'Recurrent tumour',
							'Metastatic tumour',
							'Metastatic tumour - metastasis local to lymph node',
							'Metastatic tumour - metastasis to distant location',
							'Metastatic tumour - additional metastatic',
							'Xenograft - derived from primary tumour',
							'Xenograft - derived from tumour cell line',
							'Cell line - derived from xenograft tissue',
							'Cell line - derived from tumour',
							'Cell line - derived from normal',
						],
					},
				},
				{
					name: 'submitter_sample_id',
					valueType: 'string',
					description: 'Submitter assigned sample id',
					restrictions: {
						required: true,
						regex: '^(?!(SA|sa)).+',
					},
				},
				{
					name: 'sample_type',
					valueType: 'string',
					description: 'Specimen Type',
					restrictions: {
						required: true,
						codeList: [
							'Total DNA',
							'Amplified DNA',
							'ctDNA',
							'other DNA enrichments',
							'Total RNA',
							'Ribo-Zero RNA',
							'polyA+ RNA',
							'other RNA fractions',
						],
					},
				},
			],
		},
		{
			name: 'address',
			description: 'adderss schema',
			fields: [
				{
					name: 'postal_code',
					valueType: 'string',
					description: 'postal code',
					restrictions: {
						required: true,
						script:
							'/**  important to return the result object here here */\r\n(function validate(inputs) {\r\n   const {$row, $field, $name} = inputs; var person = $row;\r\nvar postalCode = $field; var result = { valid: true, message: "ok"};\r\n\r\n    /* custom logic start */\r\n    if (person.country === "US") {\r\n        var valid = /^[0-9]{5}(?:-[0-9]{4})?$/.test(postalCode);\r\n        if (!valid) {\r\n            result.valid = false;\r\n            result.message = "invalid postal code for US";\r\n        }\r\n    } else if (person.country === "CANADA") {\r\n        var valid = /^[A-Za-z]\\d[A-Za-z][ -]?\\d[A-Za-z]\\d$/.test(postalCode);\r\n        if (!valid) {\r\n            result.valid = false;\r\n            result.message = "invalid postal code for CANADA";\r\n        }\r\n    }\r\n    /* custom logic end */\r\n\r\n    return result;\r\n})\r\n\r\n',
					},
				},
				{
					name: 'unit_number',
					valueType: 'integer',
					description: 'unit number',
					restrictions: {
						range: {
							min: 0,
							exclusiveMax: 999,
						},
					},
				},
				{
					name: 'country',
					valueType: 'string',
					description: 'Country',
					restrictions: {
						required: true,
						codeList: ['US', 'CANADA'],
					},
				},
			],
		},
		{
			name: 'donor',
			description: 'TSV for donor',
			fields: [
				{
					name: 'program_id',
					valueType: 'string',
					description: 'Unique identifier for program',
					meta: {
						key: true,
					},
					restrictions: {
						required: true,
						regex: '^[A-Z1-9][-_A-Z1-9]{2,7}(-[A-Z][A-Z])$',
					},
				},
				{
					name: 'submitter_donor_id',
					valueType: 'string',
					description: 'Unique identifier for donor, assigned by the data provider.',
					meta: {
						key: true,
					},
					restrictions: {
						required: true,
						regex: '^(?!(DO|do)).+',
					},
				},
				{
					name: 'gender',
					valueType: 'string',
					description: 'The gender of the patient',
					meta: {
						default: 'Other',
					},
					restrictions: {
						required: true,
						codeList: ['Male', 'Female', 'Other'],
					},
				},
				{
					name: 'ethnicity',
					valueType: 'string',
					description: 'The ethnicity of the patient',
					restrictions: {
						required: true,
						codeList: ['asian', 'black or african american', 'caucasian', 'not reported'],
					},
				},
				{
					name: 'vital_status',
					valueType: 'string',
					description: 'Indicate the vital status of the patient',
					restrictions: {
						required: true,
						codeList: ['alive', 'deceased'],
					},
				},
				{
					name: 'cause_of_death',
					valueType: 'string',
					description: 'Indicate the cause of death of patient',
					restrictions: {
						required: false,
						codeList: ['died of cancer', 'died of other reasons', 'N/A'],
					},
				},
				{
					name: 'survival_time',
					valueType: 'integer',
					description: 'Survival time',
					restrictions: {
						required: false,
					},
				},
			],
		},
		{
			name: 'favorite_things',
			description: 'favorite things listed',
			fields: [
				{
					name: 'id',
					valueType: 'string',
					description: 'Favourite id values',
					restrictions: {
						required: true,
						regex: '^[A-Z1-9][-_A-Z1-9]{2,7}$',
					},
				},
				{
					name: 'qWords',
					valueType: 'string',
					description: 'Words starting with q',
					restrictions: {
						required: false,
						regex: '^q.*$',
					},
					isArray: true,
				},
				{
					name: 'qWord',
					valueType: 'string',
					description: 'Word starting with q',
					restrictions: {
						required: false,
						regex: '^q.*$',
					},
					isArray: false,
				},
				{
					name: 'fruit',
					valueType: 'string',
					description: 'fruit',
					restrictions: {
						required: false,
						codeList: ['Mango', 'Orange', 'None'],
					},
					isArray: true,
				},
				{
					name: 'fruit_single_value',
					valueType: 'string',
					description: 'fruit',
					restrictions: {
						required: false,
						codeList: ['Mango', 'Orange', 'None'],
					},
					isArray: false,
				},
				{
					name: 'animal',
					valueType: 'string',
					description: 'animal',
					restrictions: {
						required: false,
						codeList: ['Dog', 'Cat', 'None'],
					},
					isArray: true,
				},
				{
					name: 'fraction',
					valueType: 'number',
					description: 'numbers between 0 and 1 exclusive',
					restrictions: { required: false, range: { max: 1, exclusiveMin: 0 } },
					isArray: true,
				},
				{
					name: 'integers',
					valueType: 'integer',
					description: 'integers between -10 and 10',
					restrictions: { required: false, range: { max: 10, min: -10 } },
					isArray: true,
				},
				{
					name: 'unique_value',
					valueType: 'string',
					description: 'unique value',
					restrictions: { required: false, unique: true },
					isArray: true,
				},
			],
		},
		{
			name: 'parent_schema_1',
			description: 'Parent schema 1. Used to test relational validations',
			fields: [
				{
					name: 'id',
					valueType: 'string',
					description: 'Id',
				},
				{
					name: 'external_id',
					valueType: 'string',
					description: 'External Id',
				},
				{
					name: 'name',
					valueType: 'string',
					description: 'Name',
				},
			],
		},
		{
			name: 'parent_schema_2',
			description: 'Parent schema 1. Used to test relational validations',
			fields: [
				{
					name: 'id1',
					valueType: 'string',
					description: 'Id 1',
					isArray: true,
				},
				{
					name: 'id2',
					valueType: 'string',
					description: 'Id 2',
					isArray: true,
				},
			],
		},
		{
			name: 'child_schema_simple_fk',
			description: 'Child schema referencing a field in a foreign schema',
			restrictions: {
				foreignKey: [
					{
						schema: 'parent_schema_1',
						mappings: [
							{
								local: 'parent_schema_1_id',
								foreign: 'id',
							},
						],
					},
				],
			},
			fields: [
				{
					name: 'id',
					valueType: 'number',
					description: 'Id',
				},
				{
					name: 'parent_schema_1_id',
					valueType: 'string',
					description: 'Reference to id in schema parent_schema_1',
				},
			],
		},
		{
			name: 'child_schema_composite_fk',
			description: 'Child schema referencing several fields in a foreign schema',
			restrictions: {
				foreignKey: [
					{
						schema: 'parent_schema_1',
						mappings: [
							{
								local: 'parent_schema_1_id',
								foreign: 'id',
							},
							{
								local: 'parent_schema_1_external_id',
								foreign: 'external_id',
							},
						],
					},
				],
			},
			fields: [
				{
					name: 'id',
					valueType: 'number',
					description: 'Id',
				},
				{
					name: 'parent_schema_1_id',
					valueType: 'string',
					description: 'Reference to id in schema parent_schema_1',
				},
				{
					name: 'parent_schema_1_external_id',
					valueType: 'string',
					description: 'Reference to external id in schema parent_schema_1',
				},
			],
		},
		{
			name: 'child_schema_composite_array_values_fk',
			description: 'Child schema referencing several fields in a foreign schema',
			restrictions: {
				foreignKey: [
					{
						schema: 'parent_schema_2',
						mappings: [
							{
								local: 'parent_schema_2_id1',
								foreign: 'id1',
							},
							{
								local: 'parent_schema_2_id12',
								foreign: 'id2',
							},
						],
					},
				],
			},
			fields: [
				{
					name: 'id',
					valueType: 'number',
					description: 'Id',
				},
				{
					name: 'parent_schema_2_id1',
					valueType: 'string',
					description: 'Reference to id1 in schema parent_schema_2',
					isArray: true,
				},
				{
					name: 'parent_schema_2_id12',
					valueType: 'string',
					description: 'Reference to external id2 in schema parent_schema_2',
					isArray: true,
				},
			],
		},
		{
			name: 'unique_key_schema',
			description: 'Schema to test uniqueKey restriction',
			restrictions: {
				uniqueKey: ['numeric_id_1', 'string_id_2', 'array_string_id_3'],
			},
			fields: [
				{
					name: 'numeric_id_1',
					valueType: 'number',
					description: 'Id 1. Numeric value as part of a composite unique key',
				},
				{
					name: 'string_id_2',
					valueType: 'string',
					description: 'Id 2. String value as part of a composite unique key',
				},
				{
					name: 'array_string_id_3',
					valueType: 'string',
					description: 'Id 3. String array as part of a composite unique key',
					isArray: true,
				},
			],
		},
	],
	name: 'ARGO Clinical Submission',
	version: '1.0',
};

export default dictionary;
