import { Schema } from '@overture-stack/lectern-dictionary';
import { assertSchema } from '../assertSchema';
import { schemaDonor } from './schemaDonor';

export const schemaComorbidity = {
	name: 'comorbidity',
	description: 'A medical condition present alongside or prior to the index disease for a donor.',
	fields: [
		{
			name: 'program_id',
			valueType: 'string',
			displayName: 'Program ID',
			description: 'Unique identifier of the program this comorbidity record belongs to.',
			restrictions: { required: true, regex: '#/regex/submitterId' },
		},
		{
			name: 'submitter_donor_id',
			valueType: 'string',
			displayName: 'Submitter Donor ID',
			description: 'Unique identifier for the donor within this program.',
			restrictions: { required: true, regex: '#/regex/submitterId' },
		},
		{
			name: 'prior_malignancy',
			valueType: 'string',
			displayName: 'Prior Malignancy',
			description: 'Whether the comorbidity is a prior malignancy.',
			restrictions: {
				codeList: '#/enum/yesNoUnknown',
			},
		},
		{
			name: 'laterality_of_prior_malignancy',
			valueType: 'string',
			displayName: 'Laterality at Prior Malignancy',
			description: 'Laterality of the prior malignancy, when applicable.',
			restrictions: [
				{
					codeList: [
						'Bilateral',
						'Left',
						'Midline',
						'Not applicable',
						'Right',
						'Unilateral, Side not specified',
						'Unknown',
					],
				},
				{
					if: { conditions: [{ fields: ['prior_malignancy'], match: { value: 'Yes' } }] },
					then: { required: true },
					else: { empty: true },
				},
			],
		},
		{
			name: 'age_at_comorbidity_diagnosis',
			valueType: 'integer',
			displayName: 'Age at Comorbidity Diagnosis',
			description: 'Age of the donor in years at the time of comorbidity diagnosis.',
			meta: { units: 'years' },
			restrictions: { range: { exclusiveMin: 0 } },
		},
		{
			name: 'comorbidity_type_code',
			valueType: 'string',
			displayName: 'Comorbidity Type Code',
			description: 'WHO ICD-10 code for the comorbidity.',
			meta: { examples: 'E10, C50.1, I11, M06' },
			restrictions: {
				required: true,
				regex: '^[A-Z][0-9]{2}(.[0-9]{1,3}[A-Z]{0,1})?$',
			},
		},
		{
			name: 'comorbidity_treatment_status',
			valueType: 'string',
			displayName: 'Comorbidity Treatment',
			description: 'Whether the donor is currently receiving treatment for this comorbidity.',
			restrictions: {
				codeList: '#/enum/yesNoUnknown',
			},
		},
		{
			name: 'comorbidity_treatment',
			valueType: 'string',
			displayName: 'Comorbidity Treatment Type',
			description: 'Description of treatment received for this comorbidity.',
		},
	],
	restrictions: {
		uniqueKey: ['program_id', 'submitter_donor_id', 'comorbidity_type_code'],
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

assertSchema(schemaComorbidity, Schema, 'schemaComorbidity is not a valid Schema');
