import { Schema } from '@overture-stack/lectern-dictionary';
import { assertSchema } from '../assertSchema';
import { schemaDonor } from './schemaDonor';

export const schemaPrimaryDiagnosis = {
	name: 'primary_diagnosis',
	description: 'Cancer diagnosis details and clinical TNM staging.',
	fields: [
		{
			name: 'program_id',
			valueType: 'string',
			displayName: 'Program ID',
			restrictions: { required: true, regex: '#/regex/submitterId' },
		},
		{
			name: 'submitter_donor_id',
			valueType: 'string',
			displayName: 'Submitter Donor ID',
			restrictions: { required: true, regex: '#/regex/submitterId' },
		},
		{
			name: 'submitter_primary_diagnosis_id',
			valueType: 'string',
			displayName: 'Submitter Primary Diagnosis ID',
			description: 'Unique identifier for this diagnosis within the program.',
			restrictions: { required: true, regex: '#/regex/submitterId' },
		},
		{
			name: 'age_at_diagnosis',
			valueType: 'integer',
			displayName: 'Age at Diagnosis',
			description: 'Age of the donor at the time of primary diagnosis (years).',
			meta: { units: 'years' },
			restrictions: {
				required: true,
				range: { exclusiveMin: 0, max: 90 },
			},
		},
		{
			name: 'cancer_type_code',
			valueType: 'string',
			displayName: 'Cancer Type Code',
			description: 'ICD-10 code for the cancer type.',
			meta: { examples: 'C41.1,C16.9,C00.5,D46.9' },
			restrictions: {
				required: true,
				regex: '^[CD][0-9]{2}(\\.[0-9]{1,3}[A-Z]?)?$',
			},
		},
		{
			name: 'cancer_type_additional_information',
			valueType: 'string',
			displayName: 'Cancer Type Additional Information',
			description: 'Additional details about the cancer type not captured by the ICD-10 code.',
		},
		{
			name: 'basis_of_diagnosis',
			valueType: 'string',
			displayName: 'Basis of Diagnosis',
			restrictions: {
				codeList: [
					'Autopsy',
					'Clinical',
					'Clinical investigation',
					'Cytology',
					'Death certificate only',
					'Histology of a metastasis',
					'Histology of a primary tumour',
					'Specific tumour markers',
					'Unknown',
				],
			},
		},
		{
			name: 'laterality',
			valueType: 'string',
			displayName: 'Laterality',
			restrictions: {
				codeList: [
					'Bilateral',
					'Left',
					'Midline',
					'Not a paired site',
					'Right',
					'Unilateral, side not specified',
					'Unknown',
				],
			},
		},
		{
			name: 'lymph_nodes_examined_status',
			valueType: 'string',
			displayName: 'Lymph Nodes Examined Status',
			restrictions: {
				required: true,
				codeList: ['Cannot be determined', 'No', 'No lymph nodes found in resected specimen', 'Not applicable', 'Yes'],
			},
		},
		{
			name: 'lymph_nodes_examined_method',
			valueType: 'string',
			displayName: 'Method Used to Examine Lymph Nodes',
			restrictions: [
				{
					codeList: ['Imaging', 'Lymph node dissection/pathological exam', 'Physical palpation of patient'],
				},
				{
					if: { conditions: [{ fields: ['lymph_nodes_examined_status'], match: { value: 'Yes' } }] },
					then: { required: true },
					else: { empty: true },
				},
			],
		},
		{
			name: 'number_lymph_nodes_examined',
			valueType: 'integer',
			displayName: 'Number Of Lymph Nodes Examined',
			description: 'Total number of lymph nodes tested for the presence of cancer.',
			restrictions: [
				{ range: { min: 0 } },
				{
					if: { conditions: [{ fields: ['lymph_nodes_examined_status'], match: { value: 'Yes' } }] },
					then: { required: true },
					else: { empty: true },
				},
			],
		},
		{
			name: 'number_lymph_nodes_positive',
			valueType: 'integer',
			displayName: 'Number Of Lymph Nodes Positive',
			description: 'Number of regional lymph nodes positive for tumour metastases.',
			restrictions: [
				{ range: { min: 0 } },
				{
					if: { conditions: [{ fields: ['lymph_nodes_examined_status'], match: { value: 'Yes' } }] },
					then: { required: true },
					else: { empty: true },
				},
			],
		},
		{
			name: 'clinical_tumour_staging_system',
			valueType: 'string',
			displayName: 'Clinical Tumour Staging System',
			description:
				'Tumour staging system used to stage the cancer at the time of primary diagnosis, prior to treatment.',
			restrictions: {
				codeList: '#/enum/tumorStagingSystem',
			},
		},
		{
			name: 'clinical_t_category',
			valueType: 'string',
			displayName: 'Clinical T Category',
			description:
				'Extent of the primary tumour (T) based on clinical assessment at time of primary diagnosis and prior to treatment.',
			meta: {
				notes:
					'This field is required only if the selected clinical_tumour_staging_system is any edition of the AJCC cancer staging system.',
			},
			restrictions: [
				{ codeList: '#/enum/tCategories' },
				{
					if: {
						conditions: [{ fields: ['clinical_tumour_staging_system'], match: { codeList: ['#/enum/ajccEditions'] } }],
					},
					then: { required: true },
					else: { empty: true },
				},
			],
		},
		{
			name: 'clinical_n_category',
			valueType: 'string',
			displayName: 'Clinical N Category',
			description:
				'Regional lymph node involvement (N) based on clinical assessment at time of primary diagnosis and prior to treatment.',
			meta: {
				notes:
					'This field is required only if the selected clinical_tumour_staging_system is any edition of the AJCC cancer staging system.',
			},
			restrictions: [
				{ codeList: '#/enum/nCategories' },
				{
					if: {
						conditions: [{ fields: ['clinical_tumour_staging_system'], match: { codeList: ['#/enum/ajccEditions'] } }],
					},
					then: { required: true },
					else: { empty: true },
				},
			],
		},
		{
			name: 'clinical_m_category',
			valueType: 'string',
			displayName: 'Clinical M Category',
			description:
				'Extent of distant metastasis (M) based on clinical assessment at time of primary diagnosis and prior to treatment.',
			meta: {
				notes:
					'This field is required only if the selected clinical_tumour_staging_system is any edition of the AJCC cancer staging system.',
			},
			restrictions: [
				{ codeList: '#/enum/mCategories' },
				{
					if: {
						conditions: [{ fields: ['clinical_tumour_staging_system'], match: { codeList: ['#/enum/ajccEditions'] } }],
					},
					then: { required: true },
					else: { empty: true },
				},
			],
		},
		{
			name: 'clinical_stage_group',
			valueType: 'string',
			displayName: 'Clinical Stage Group',
			description: 'Overall clinical stage group assigned by the selected tumour staging system.',
			meta: { examples: 'Stage I, Stage IIB' },
			restrictions: [
				{ codeList: '#/enum/stageGroups' },
				{
					if: {
						conditions: [{ fields: ['clinical_tumour_staging_system'], match: { exists: true } }],
					},
					then: { required: true },
				},
			],
		},
		{
			name: 'presenting_symptoms',
			valueType: 'string',
			displayName: 'Presenting Symptoms',
			isArray: true,
			restrictions: {
				codeList: [
					'Abdominal Pain',
					'Anemia',
					'Back Pain',
					'Bloating',
					'Cholangitis',
					'Constipation',
					'Dark Urine',
					'Decreased Appetite',
					'Diabetes',
					'Diarrhea',
					'Fatigue',
					'Fever',
					'Hypoglycemia',
					'Jaundice',
					'Loss of Appetite',
					'Nausea',
					'None',
					'Not Reported',
					'Pale Stools',
					'Pancreatitis',
					'Pruritus/Itchiness',
					'Steatorrhea',
					'Swelling in the Neck',
					'Unknown',
					'Vomiting',
					'Weight Loss',
				],
			},
		},
		{
			name: 'performance_status',
			valueType: 'string',
			displayName: 'Performance Status',
			description: "Donor's ECOG performance status grade at the time of primary diagnosis.",
			restrictions: {
				codeList: ['Grade 0', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Unknown'],
			},
		},
	],
	restrictions: {
		uniqueKey: ['program_id', 'submitter_donor_id', 'submitter_primary_diagnosis_id'],
		foreignKey: [
			{
				schema: schemaDonor.name,
				mappings: [
					{ local: 'program_id', foreign: 'program_id' },
					{ local: 'submitter_donor_id', foreign: 'submitter_donor_id' },
				],
			},
		],
	},
} as const satisfies Schema;

assertSchema(schemaPrimaryDiagnosis, Schema, 'schemaPrimaryDiagnosis is not a valid Schema');
