import { Schema, StringFieldRestrictions } from '@overture-stack/lectern-dictionary';
import { assertSchema } from '../assertSchema';
import { schemaDonor } from './schemaDonor';
import { schemaPrimaryDiagnosis } from './schemaPrimaryDiagnosis';
import { schemaTreatment } from './schemaTreatment';

// TypeScript cannot narrow a reference tag string as StringFieldRestrictions within a restrictions array union.
// These typed constants guide inference without requiring per-element type assertions.
const tCategoriesRestriction: StringFieldRestrictions = { codeList: '#/enum/tCategories' };
const nCategoriesRestriction: StringFieldRestrictions = { codeList: '#/enum/nCategories' };
const mCategoriesRestriction: StringFieldRestrictions = { codeList: '#/enum/mCategories' };
const stageGroupsRestriction: StringFieldRestrictions = { codeList: '#/enum/stageGroups' };

export const schemaFollowUp = {
	name: 'follow_up',
	description: 'A follow-up visit or contact with a donor after primary diagnosis.',
	fields: [
		{
			name: 'program_id',
			valueType: 'string',
			displayName: 'Program ID',
			description: 'Unique identifier of the program this follow-up record belongs to.',
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
			name: 'submitter_follow_up_id',
			valueType: 'string',
			displayName: 'Submitter Follow-Up ID',
			description: 'Unique identifier for this follow-up event within the donor record.',
			restrictions: { required: true, regex: '#/regex/submitterId' },
		},
		{
			name: 'interval_of_followup',
			valueType: 'integer',
			displayName: 'Interval Of Follow-Up',
			description: 'Interval in days from primary diagnosis to this follow-up.',
			meta: { units: 'days' },
			restrictions: { required: true, range: { min: 0 } },
		},
		{
			name: 'disease_status_at_followup',
			valueType: 'string',
			displayName: 'Disease Status at Follow-Up',
			description: "Donor's disease status at the time of this follow-up.",
			restrictions: {
				required: true,
				codeList: [
					'Complete remission',
					'Distant progression',
					'Loco-regional progression',
					'No evidence of disease',
					'Partial remission',
					'Progression NOS',
					'Relapse or recurrence',
					'Stable',
				],
			},
		},
		{
			name: 'submitter_primary_diagnosis_id',
			valueType: 'string',
			displayName: 'Submitter Primary Diagnosis ID',
			description: 'The primary diagnosis event this follow-up is associated with.',
			restrictions: { regex: '#/regex/submitterId' },
		},
		{
			name: 'submitter_treatment_id',
			valueType: 'string',
			displayName: 'Submitter Treatment ID',
			description: 'The treatment event this follow-up is associated with.',
			restrictions: { regex: '#/regex/submitterId' },
		},
		{
			name: 'weight_at_followup',
			valueType: 'number',
			displayName: 'Weight at Follow-Up',
			description: 'Donor weight in kilograms at the time of this follow-up.',
			restrictions: { range: { exclusiveMin: 0 } },
		},
		{
			name: 'relapse_type',
			valueType: 'string',
			displayName: 'Relapse Type',
			description: 'Type of relapse or recurrence, when applicable.',
			restrictions: {
				codeList: [
					'Distant recurrence/metastasis',
					'Local recurrence',
					'Local recurrence and distant metastasis',
					'Progression (liquid tumours)',
				],
			},
		},
		{
			name: 'relapse_interval',
			valueType: 'integer',
			displayName: 'Relapse Interval',
			description: 'Days from primary diagnosis to relapse or recurrence.',
			meta: { units: 'days' },
		},
		{
			name: 'method_of_progression_status',
			valueType: 'string',
			displayName: 'Method Of Progression Status',
			isArray: true,
			description: 'Method(s) used to confirm disease progression, relapse, or recurrence.',
			restrictions: {
				codeList: [
					'Biomarker in liquid biopsy (e.g. tumour marker in blood or urine)',
					'Biopsy',
					'Blood draw',
					'Bone marrow aspirate',
					'Core biopsy',
					'Cystoscopy',
					'Cytology',
					'Debulking',
					'Diagnostic imaging',
					'Dilation and curettage procedure',
					'Enucleation',
					'Excisional biopsy',
					'Fine needle aspiration',
					'Imaging',
					'Incisional biopsy',
					'Laparoscopy',
					'Laparotomy',
					'Other',
					'Pap Smear',
					'Pathologic review',
					'Physical exam',
					'Surgical resection',
					'Thoracentesis',
					'Ultrasound guided biopsy',
				],
			},
		},
		{
			name: 'anatomic_site_progression_or_recurrence',
			valueType: 'string',
			displayName: 'Anatomic Site Progression or Recurrences',
			isArray: true,
			description: 'ICD-O-3 topography code(s) for the anatomic site(s) of disease progression or recurrence.',
			meta: { examples: 'C50.1|C18' },
			restrictions: {
				regex: '^[C][0-9]{2}(.[0-9]{1})?$',
			},
		},
		{
			name: 'recurrence_tumour_staging_system',
			valueType: 'string',
			displayName: 'Recurrence Tumour Staging System',
			description:
				'Tumour staging system used to stage the cancer at time of retreatment for recurrence or progression.',
			restrictions: {
				codeList: '#/enum/tumorStagingSystem',
			},
		},
		{
			name: 'recurrence_t_category',
			valueType: 'string',
			displayName: 'Recurrence T Category',
			description: 'Extent of the primary tumour (T) at time of retreatment, per the recurrence staging system.',
			meta: {
				notes:
					'This field is required only if the selected recurrence_tumour_staging_system is any edition of the AJCC cancer staging system.',
			},
			restrictions: [
				tCategoriesRestriction,
				{
					if: {
						conditions: [{ fields: ['recurrence_tumour_staging_system'], match: { codeList: ['#/enum/ajccEditions'] } }],
					},
					then: { required: true },
					else: { empty: true },
				},
			],
		},
		{
			name: 'recurrence_n_category',
			valueType: 'string',
			displayName: 'Recurrence N Category',
			description: 'Regional lymph node involvement (N) at time of retreatment, per the recurrence staging system.',
			meta: {
				notes:
					'This field is required only if the selected recurrence_tumour_staging_system is any edition of the AJCC cancer staging system.',
			},
			restrictions: [
				nCategoriesRestriction,
				{
					if: {
						conditions: [{ fields: ['recurrence_tumour_staging_system'], match: { codeList: ['#/enum/ajccEditions'] } }],
					},
					then: { required: true },
					else: { empty: true },
				},
			],
		},
		{
			name: 'recurrence_m_category',
			valueType: 'string',
			displayName: 'Recurrence M Category',
			description: 'Extent of distant metastasis (M) at time of retreatment, per the recurrence staging system.',
			meta: {
				notes:
					'This field is required only if the selected recurrence_tumour_staging_system is any edition of the AJCC cancer staging system.',
			},
			restrictions: [
				mCategoriesRestriction,
				{
					if: {
						conditions: [{ fields: ['recurrence_tumour_staging_system'], match: { codeList: ['#/enum/ajccEditions'] } }],
					},
					then: { required: true },
					else: { empty: true },
				},
			],
		},
		{
			name: 'recurrence_stage_group',
			valueType: 'string',
			displayName: 'Recurrence Stage Group',
			description: 'Overall stage group assigned by the recurrence staging system.',
			restrictions: [
				stageGroupsRestriction,
				{
					if: {
						conditions: [{ fields: ['recurrence_tumour_staging_system'], match: { exists: true } }],
					},
					then: { required: true },
				},
			],
		},
		{
			name: 'posttherapy_tumour_staging_system',
			valueType: 'string',
			displayName: 'Post-therapy Tumour Staging System',
			description:
				'Tumour staging system used to stage the cancer after systemic or radiation therapy, or neoadjuvant therapy.',
			restrictions: {
				codeList: '#/enum/tumorStagingSystem',
			},
		},
		{
			name: 'posttherapy_t_category',
			valueType: 'string',
			displayName: 'Post-therapy T Category',
			description: 'Extent of the primary tumour (T) after therapy, per the post-therapy staging system.',
			meta: {
				notes:
					'This field is required only if the selected posttherapy_tumour_staging_system is any edition of the AJCC cancer staging system.',
			},
			restrictions: [
				tCategoriesRestriction,
				{
					if: {
						conditions: [{ fields: ['posttherapy_tumour_staging_system'], match: { codeList: ['#/enum/ajccEditions'] } }],
					},
					then: { required: true },
					else: { empty: true },
				},
			],
		},
		{
			name: 'posttherapy_n_category',
			valueType: 'string',
			displayName: 'Post-therapy N Category',
			description: 'Regional lymph node involvement (N) after therapy, per the post-therapy staging system.',
			meta: {
				notes:
					'This field is required only if the selected posttherapy_tumour_staging_system is any edition of the AJCC cancer staging system.',
			},
			restrictions: [
				nCategoriesRestriction,
				{
					if: {
						conditions: [{ fields: ['posttherapy_tumour_staging_system'], match: { codeList: ['#/enum/ajccEditions'] } }],
					},
					then: { required: true },
					else: { empty: true },
				},
			],
		},
		{
			name: 'posttherapy_m_category',
			valueType: 'string',
			displayName: 'Post-therapy M Category',
			description: 'Extent of distant metastasis (M) after therapy, per the post-therapy staging system.',
			meta: {
				notes:
					'This field is required only if the selected posttherapy_tumour_staging_system is any edition of the AJCC cancer staging system.',
			},
			restrictions: [
				mCategoriesRestriction,
				{
					if: {
						conditions: [{ fields: ['posttherapy_tumour_staging_system'], match: { codeList: ['#/enum/ajccEditions'] } }],
					},
					then: { required: true },
					else: { empty: true },
				},
			],
		},
		{
			name: 'posttherapy_stage_group',
			valueType: 'string',
			displayName: 'Post-therapy Stage Group',
			description: 'Overall stage group assigned by the post-therapy staging system.',
			restrictions: [
				stageGroupsRestriction,
				{
					if: {
						conditions: [{ fields: ['posttherapy_tumour_staging_system'], match: { exists: true } }],
					},
					then: { required: true },
				},
			],
		},
	],
	restrictions: {
		uniqueKey: ['program_id', 'submitter_donor_id', 'submitter_follow_up_id'],
		foreignKey: [
			{
				schema: schemaDonor.name,
				mappings: [
					{ local: 'program_id', foreign: 'program_id' },
					{ local: 'submitter_donor_id', foreign: 'submitter_donor_id' },
				],
			},
			{
				schema: schemaPrimaryDiagnosis.name,
				mappings: [
					{ local: 'program_id', foreign: 'program_id' },
					{ local: 'submitter_donor_id', foreign: 'submitter_donor_id' },
					{ local: 'submitter_primary_diagnosis_id', foreign: 'submitter_primary_diagnosis_id' },
				],
			},
			{
				schema: schemaTreatment.name,
				mappings: [
					{ local: 'program_id', foreign: 'program_id' },
					{ local: 'submitter_donor_id', foreign: 'submitter_donor_id' },
					{ local: 'submitter_treatment_id', foreign: 'submitter_treatment_id' },
				],
			},
		],
	},
} as const satisfies Schema;

assertSchema(schemaFollowUp, Schema, 'schemaFollowUp is not a valid Schema');
