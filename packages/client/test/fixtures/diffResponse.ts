import { DictionaryDiffArray } from '@overture-stack/lectern-dictionary';

const diffResponse = [
	[
		'donor.submitter_donor_id',
		{
			left: {
				description: 'Unique identifier of the donor, assigned by the data provider.',
				name: 'submitter_donor_id',
				restrictions: {
					required: true,
					regex: '[A-Za-z0-9\\-\\._]{1,64}',
				},
				valueType: 'string',
			},
			right: {
				description: 'Unique identifier of the donor, assigned by the data provider.',
				name: 'submitter_donor_id',
				restrictions: {
					required: true,
					regex: '[A-Za-z0-9\\-\\._]{3,64}',
				},
				valueType: 'string',
			},
			diff: {
				restrictions: {
					regex: {
						type: 'updated',
						data: '[A-Za-z0-9\\-\\._]{3,64}',
					},
				},
			},
		},
	],
	[
		'donor.vital_status',
		{
			left: {
				description: 'Donors last known state of living or deceased.',
				name: 'vital_status',
				restrictions: {
					codeList: ['Alive', 'Deceased', 'Not reported', 'Unknown'],
					required: true,
				},
				valueType: 'string',
			},
			right: {
				description: 'Donors last known state of living or deceased.',
				name: 'vital_status',
				restrictions: {
					regex: '[A-Z]{3,100}',
					required: true,
				},
				valueType: 'string',
			},
			diff: {
				restrictions: {
					codeList: {
						type: 'deleted',
						data: ['Alive', 'Deceased', 'Not reported', 'Unknown'],
					},
					regex: {
						type: 'created',
						data: '[A-Z]{3,100}',
					},
				},
			},
		},
	],
	[
		'donor.cause_of_death',
		{
			left: {
				description: "Description of the cause of a donor's death.",
				name: 'cause_of_death',
				restrictions: {
					codeList: ['Died of cancer', 'Died of other reasons', 'Not reported', 'Unknown'],
				},
				valueType: 'string',
			},
			right: {
				description: "Description of the cause of a donor's death.",
				name: 'cause_of_death',
				restrictions: {
					codeList: ['Died of other reasons', 'Not reported', 'N/A'],
				},
				valueType: 'string',
			},
			diff: {
				restrictions: {
					codeList: {
						type: 'updated',
						data: {
							added: ['N/A'],
							deleted: ['Died of cancer', 'Unknown'],
						},
					},
				},
			},
		},
	],
	[
		'donor.survival_time',
		{
			left: {
				description: 'Interval of how long the donor has survived since primary diagnosis, in days.',
				meta: {
					units: 'days',
				},
				name: 'survival_time',
				valueType: 'integer',
			},
			right: {
				description: 'Interval of how long the donor has survived since primary diagnosis, in days.',
				meta: {
					units: 'days',
				},
				name: 'survival_time',
				valueType: 'integer',
				restrictions: {
					range: {
						min: 0,
						max: 200000,
					},
				},
			},
			diff: {
				restrictions: {
					type: 'created',
					data: {
						range: {
							min: 0,
							max: 200000,
						},
					},
				},
			},
		},
	],
	[
		'primary_diagnosis.cancer_type_code',
		{
			left: {
				name: 'cancer_type_code',
				valueType: 'string',
				description:
					'The code to represent the cancer type using the WHO ICD-10 code (https://icd.who.int/browse10/2016/en#/) classification.',
				restrictions: {
					required: true,
					regex: '[A-Z]{1}[0-9]{2}.[0-9]{0,3}[A-Z]{0,1}$',
				},
			},
			right: {
				name: 'cancer_type_code',
				valueType: 'string',
				description:
					'The code to represent the cancer type using the WHO ICD-10 code (https://icd.who.int/browse10/2016/en#/) classification.',
				restrictions: {
					required: true,
					regex: '[A-Z]{1}[0-9]{2}.[0-9]{0,3}[A-Z]{2,3}$',
				},
			},
			diff: {
				restrictions: {
					regex: {
						type: 'updated',
						data: '[A-Z]{1}[0-9]{2}.[0-9]{0,3}[A-Z]{2,3}$',
					},
				},
			},
		},
	],
	[
		'primary_diagnosis.menopause_status',
		{
			left: {
				name: 'menopause_status',
				description: 'Indicate the menopause status of the patient at the time of primary diagnosis.',
				valueType: 'string',
				restrictions: {
					codeList: ['Perimenopausal', 'Postmenopausal', 'Premenopausal', 'Unknown'],
				},
			},
			diff: {
				type: 'deleted',
				data: {
					name: 'menopause_status',
					description: 'Indicate the menopause status of the patient at the time of primary diagnosis.',
					valueType: 'string',
					restrictions: {
						codeList: ['Perimenopausal', 'Postmenopausal', 'Premenopausal', 'Unknown'],
					},
				},
			},
		},
	],
	[
		'primary_diagnosis.presenting_symptoms',
		{
			left: {
				name: 'presenting_symptoms',
				description: 'Indicate presenting symptoms at time of primary diagnosis.',
				valueType: 'string',
				restrictions: {
					codeList: ['Abdominal Pain', 'Anemia', 'Diabetes', 'Diarrhea', 'Nausea', 'None'],
				},
			},
			right: {
				name: 'presenting_symptoms',
				description: 'Indicate presenting symptoms at time of primary diagnosis.',
				valueType: 'string',
				isArray: true,
				restrictions: {
					codeList: ['Abdominal Pain', 'Anemia', 'Diabetes', 'Diarrhea', 'Nausea', 'None'],
				},
			},
			diff: {
				isArray: {
					type: 'created',
					data: true,
				},
			},
		},
	],
	[
		'sample_registration.program_id',
		{
			left: {
				name: 'program_id',
				valueType: 'string',
				description: 'Unique identifier of the ARGO program.',
				meta: {
					validationDependency: true,
					primaryId: true,
					examples: 'PACA-AU,BR-CA',
					displayName: 'Program ID',
				},
				restrictions: {
					required: true,
				},
			},
			right: {
				name: 'program_id',
				valueType: 'integer',
				description: 'Unique identifier of the ARGO program.',
				meta: {
					validationDependency: true,
					primaryId: true,
					examples: 'PACA-AU,BR-CA',
					displayName: 'Program ID',
				},
				restrictions: {
					required: true,
				},
			},
			diff: {
				valueType: {
					type: 'updated',
					data: 'integer',
				},
			},
		},
	],
	[
		'specimen.percent_stromal_cells',
		{
			left: {
				name: 'percent_stromal_cells',
				description:
					'Indicate a value, in decimals, that represents the percentage of reactive cells that are present in a malignant tumour specimen but are not malignant such as fibroblasts, vascular structures, etc.',
				valueType: 'number',
				meta: {
					dependsOn: 'sample_registration.tumour_normal_designation',
					notes: '',
					displayName: 'Percent Stromal Cells',
				},
				restrictions: {
					range: {
						min: 0,
						max: 0.1,
					},
				},
			},
			right: {
				name: 'percent_stromal_cells',
				description:
					'Indicate a value, in decimals, that represents the percentage of reactive cells that are present in a malignant tumour specimen but are not malignant such as fibroblasts, vascular structures, etc.',
				valueType: 'number',
				meta: {
					dependsOn: 'sample_registration.tumour_normal_designation',
					notes: '',
					displayName: 'Percent Stromal Cells',
				},
				restrictions: {
					range: {
						max: 1,
					},
				},
			},
			diff: {
				restrictions: {
					range: {
						min: {
							type: 'deleted',
							data: 0,
						},
						max: {
							type: 'updated',
							data: 1,
						},
					},
				},
			},
		},
	],
] satisfies DictionaryDiffArray;
export default diffResponse;
