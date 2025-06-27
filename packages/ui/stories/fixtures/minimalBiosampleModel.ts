import { Dictionary } from '@overture-stack/lectern-dictionary';
import assert from 'node:assert';

const dictionary: Dictionary = {
	name: 'minimal-biosample-model',
	version: '1.0',
	description: 'Example dictionary, representing minimal fields required for collecting genomic biosample information.',
	schemas: [
		{
			name: 'donor',
			restrictions: {
				uniqueKey: ['donor_submitter_id'],
			},
			fields: [
				{
					name: 'donor_submitter_id',
					valueType: 'string',
					restrictions: {
						required: true,
						regex: '#/regex/submitter_id',
					},
					meta: {
						examples: ['DONOR12345'],
					},
				},
				{
					name: 'gender',
					valueType: 'string',
					restrictions: {
						required: true,
						codeList: '#/list/gender',
					},
				},
				{
					name: 'age',
					valueType: 'integer',
					restrictions: {
						range: { min: 0, max: 150 },
					},
				},
			],
		},
		{
			name: 'specimen',
			restrictions: {
				uniqueKey: ['specimen_submitter_id'],
				foreignKey: [
					{
						mappings: [{ foreign: 'donor_submitter_id', local: 'donor_submitter_id' }],
						schema: 'donor',
					},
				],
			},
			fields: [
				{
					name: 'specimen_submitter_id',
					valueType: 'string',
					restrictions: {
						required: true,
						regex: '#/regex/submitter_id',
					},
				},
				{
					name: 'donor_submitter_id',
					valueType: 'string',
					restrictions: {
						required: true,
						regex: '#/regex/submitter_id',
					},
				},
				{
					name: 'tissue_source',
					valueType: 'string',
					restrictions: {
						required: true,
						codeList: '#/list/tissue_source',
					},
				},
				{
					name: 'tissue_source_other',
					description: `If the tissue source is 'other', specify the source here.`,
					valueType: 'string',
					restrictions: {
						if: {
							conditions: [
								{
									fields: ['tissue_source'],
									match: {
										value: 'Other',
									},
								},
							],
						},
						then: {
							required: true,
						},
						else: {
							empty: true,
						},
					},
				},
				{
					name: 'specimen_type',
					description: 'Kind of specimen that was collected with respect to tumour/normal tissue origin.',
					valueType: 'string',
				},
			],
		},
		{
			name: 'sample',
			restrictions: {
				uniqueKey: ['sample_submitter_id'],
				foreignKey: [
					{
						mappings: [{ foreign: 'specimen_submitter_id', local: 'specimen_submitter_id' }],
						schema: 'specimen',
					},
				],
			},
			fields: [
				{
					name: 'sample_submitter_id',
					valueType: 'string',
					restrictions: {
						required: true,
						regex: '#/regex/submitter_id',
					},
				},
				{
					name: 'specimen_submitter_id',
					valueType: 'string',
					restrictions: {
						required: true,
						regex: '#/regex/submitter_id',
					},
				},
				{
					name: 'sample_type',
					description: 'Type of molecular sample used for testing.',
					valueType: 'string',
				},
			],
		},
	],
	references: {
		regex: {
			submitter_id: '^[a-zA-Z0-9_-]+$',
		},
		list: {
			gender: ['Male', 'Female', 'Other'],
			tissue_source: [
				'Blood derived - bone marrow',
				'Blood derived - peripheral blood',
				'Blood derived',
				'Bone marrow',
				'Bone',
				'Buccal cell',
				'Buffy coat',
				'Cerebellum',
				'Cerebrospinal fluid',
				'Endometrium',
				'Esophagus',
				'Intestine',
				'Lymph node',
				'Mononuclear cells from bone marrow',
				'Other',
				'Plasma',
				'Pleural effusion',
				'Saliva',
				'Serum',
				'Skin',
				'Solid tissue',
				'Spleen',
				'Sputum',
				'Stomach',
				'Tonsil',
				'Urine',
			],
		},
	},
};

export default dictionary;
