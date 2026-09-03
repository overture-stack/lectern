import { Schema, StringFieldRestrictions } from '@overture-stack/lectern-dictionary';
import { assertSchema } from '../assertSchema';
import { schemaDonor } from './schemaDonor';
import { schemaPrimaryDiagnosis } from './schemaPrimaryDiagnosis';


// TypeScript cannot narrow a reference tag string as StringFieldRestrictions within a restrictions array union.
// These typed constants guide inference without requiring per-element type assertions.
const tCategoriesRestriction: StringFieldRestrictions = { codeList: '#/enum/tCategories' };
const nCategoriesRestriction: StringFieldRestrictions = { codeList: '#/enum/nCategories' };
const mCategoriesRestriction: StringFieldRestrictions = { codeList: '#/enum/mCategories' };
const stageGroupsRestriction: StringFieldRestrictions = { codeList: '#/enum/stageGroups' };

export const schemaSpecimen = {
	name: 'specimen',
	description: 'Biospecimen details and pathological staging.',
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
			name: 'submitter_specimen_id',
			valueType: 'string',
			displayName: 'Submitter Specimen ID',
			restrictions: { required: true, regex: '#/regex/submitterId' },
		},
		{
			name: 'submitter_primary_diagnosis_id',
			valueType: 'string',
			displayName: 'Submitter Primary Diagnosis ID',
			description: 'The primary diagnosis event this specimen acquisition is related to.',
			restrictions: { required: true, regex: '#/regex/submitterId' },
		},
		{
			name: 'tumour_normal_designation',
			valueType: 'string',
			displayName: 'Tumour Normal Designation',
			restrictions: {
				required: true,
				codeList: ['Normal', 'Tumour'],
			},
		},
		{
			name: 'specimen_type',
			valueType: 'string',
			displayName: 'Specimen Type',
			restrictions: {
				required: true,
				codeList: [
					'Cell line - derived from normal',
					'Cell line - derived from tumour',
					'Cell line - derived from xenograft tumour',
					'Metastatic tumour - additional metastatic',
					'Metastatic tumour - metastasis local to lymph node',
					'Metastatic tumour - metastasis to distant location',
					'Metastatic tumour',
					'Normal - tissue adjacent to primary tumour',
					'Primary tumour - additional new primary',
					'Primary tumour - adjacent to normal',
					'Primary tumour',
					'Recurrent tumour',
					'Solid tissue - normal',
					'Xenograft - derived from primary tumour',
					'Xenograft - derived from tumour cell line',
				],
			},
		},
		{
			name: 'specimen_tissue_source',
			valueType: 'string',
			displayName: 'Specimen Tissue Source',
			restrictions: {
				required: true,
				codeList: [
					'Abdominal fluid',
					'Amniotic fluid',
					'Arterial blood',
					'Bile',
					'Blood venous',
					'Bone',
					'Bone marrow',
					'Buccal cell',
					'Buffy coat',
					'Cerebrospinal fluid',
					'Cervical swab',
					'Cord blood',
					'Endometrial curettings',
					'Esophageal brush',
					'Fibroblasts from cultured cells',
					'Fine needle aspiration',
					'Granulocytes',
					'Ileal fluid',
					'Kidney cells from normal tissue',
					'Lymphocytes',
					'Lymphoblastoid cell lines',
					'Metastatic tumour tissue',
					'Normal kidney tissue',
					'Normal liver tissue',
					'Not applicable',
					'Pleural fluid',
					'PBMC',
					'Plasma',
					'Rectal swab',
					'Saliva',
					'Serum',
					'Skin',
					'Sputum',
					'Stool',
					'Synovial fluid',
					'Tumour tissue - metastatic',
					'Tumour tissue - primary',
					'Urine',
					'Venous blood',
					'Whole blood',
					'Unknown',
				],
			},
		},
		{
			name: 'specimen_acquisition_interval',
			valueType: 'integer',
			displayName: 'Specimen Acquisition Interval',
			description: 'Interval in days between primary diagnosis and specimen acquisition.',
			meta: { units: 'days' },
			restrictions: { required: true, range: { min: 0 } },
		},
		{
			name: 'specimen_anatomic_location',
			valueType: 'string',
			displayName: 'Specimen Anatomic Location',
			description: 'ICD-O-3 topography code for the anatomic location of the specimen.',
			meta: { examples: 'C50.1,C18' },
			restrictions: {
				required: true,
				regex: '^C[0-9]{2}(\\.[0-9])?$',
			},
		},
		{
			name: 'tumour_histological_type',
			valueType: 'string',
			displayName: 'Tumour Histological Type',
			description: 'ICD-O-3 morphology code for tumour histological type. Required for tumour specimens.',
			meta: { examples: '8260/3,9691/36' },
			restrictions: {
				if: { conditions: [{ fields: ['tumour_normal_designation'], match: { value: 'Tumour' } }] },
				then: { required: true },
				else: { empty: true },
			},
		},
		{
			name: 'specimen_laterality',
			valueType: 'string',
			displayName: 'Specimen Laterality',
			description: 'For cancer in a paired organ, the side on which the specimen was obtained.',
			restrictions: {
				codeList: ['Left', 'Not applicable', 'Right', 'Unknown'],
			},
		},
		{
			name: 'specimen_processing',
			valueType: 'string',
			displayName: 'Specimen Processing',
			description: 'Technique used to process the specimen.',
			restrictions: {
				codeList: [
					'Cryopreservation in liquid nitrogen (dead tissue)',
					'Cryopreservation in dry ice (dead tissue)',
					'Cryopreservation of live cells in liquid nitrogen',
					'Cryopreservation - other',
					'Formalin fixed & paraffin embedded',
					'Formalin fixed - buffered',
					'Formalin fixed - unbuffered',
					'Fresh',
					'Other',
					'Unknown',
				],
			},
		},
		{
			name: 'specimen_storage',
			valueType: 'string',
			displayName: 'Specimen Storage',
			description: 'Method of specimen storage for specimens not extracted freshly or immediately cultured.',
			restrictions: {
				codeList: [
					'Cut slide',
					'Frozen in -70 freezer',
					'Frozen in liquid nitrogen',
					'Frozen in vapour phase',
					'Not Applicable',
					'Other',
					'Paraffin block',
					'RNA later frozen',
					'Unknown',
				],
			},
		},
		{
			name: 'reference_pathology_confirmed',
			valueType: 'string',
			displayName: 'Reference Pathology Confirmed',
			description: 'Whether the pathological diagnosis was confirmed by a reference pathologist.',
			restrictions: {
				codeList: '#/enum/yesNoUnknown',
			},
		},
		{
			name: 'pathological_tumour_staging_system',
			valueType: 'string',
			displayName: 'Pathological Tumour Staging System',
			description:
				'Tumour staging system used to assess the cancer at the time the tumour specimen was resected.',
			restrictions: {
				codeList: '#/enum/tumorStagingSystem',
			},
		},
		{
			name: 'pathological_t_category',
			valueType: 'string',
			displayName: 'Pathological T Category',
			description:
				'Size or contiguous extension of the primary tumour (T), per the pathological staging system.',
			meta: {
				notes:
					'This field is required only if the selected pathological_tumour_staging_system is any edition of the AJCC cancer staging system.',
			},
			restrictions: [
				tCategoriesRestriction,
				{
					if: {
						conditions: [{ fields: ['pathological_tumour_staging_system'], match: { codeList: ['#/enum/ajccEditions'] } }],
					},
					then: { required: true },
					else: { empty: true },
				},
			],
		},
		{
			name: 'pathological_n_category',
			valueType: 'string',
			displayName: 'Pathological N Category',
			description: 'Regional lymph node involvement (N), per the pathological staging system.',
			meta: {
				notes:
					'This field is required only if the selected pathological_tumour_staging_system is any edition of the AJCC cancer staging system.',
			},
			restrictions: [
				nCategoriesRestriction,
				{
					if: {
						conditions: [{ fields: ['pathological_tumour_staging_system'], match: { codeList: ['#/enum/ajccEditions'] } }],
					},
					then: { required: true },
					else: { empty: true },
				},
			],
		},
		{
			name: 'pathological_m_category',
			valueType: 'string',
			displayName: 'Pathological M Category',
			description: 'Extent of distant metastasis (M), per the pathological staging system.',
			meta: {
				notes:
					'This field is required only if the selected pathological_tumour_staging_system is any edition of the AJCC cancer staging system.',
			},
			restrictions: [
				mCategoriesRestriction,
				{
					if: {
						conditions: [{ fields: ['pathological_tumour_staging_system'], match: { codeList: ['#/enum/ajccEditions'] } }],
					},
					then: { required: true },
					else: { empty: true },
				},
			],
		},
		{
			name: 'pathological_stage_group',
			valueType: 'string',
			displayName: 'Pathological Stage Group',
			description:
				'Overall pathological stage group assigned by the selected tumour staging system at specimen resection.',
			restrictions: [
				stageGroupsRestriction,
				{
					if: {
						conditions: [{ fields: ['pathological_tumour_staging_system'], match: { exists: true } }],
					},
					then: { required: true },
				},
			],
		},
		{
			name: 'tumour_grading_system',
			valueType: 'string',
			displayName: 'Tumour Grading System',
			description:
				'Tumour grading system used to describe the tumour based on how abnormal the cells look under a microscope.',
			restrictions: {
				codeList: [
					'FNCLCC grading system',
					'Four-tier grading system',
					'Gleason grade group system',
					'Grading system for GISTs',
					'Grading system for GNETs',
					'ISUP grading system',
					'Nuclear grading system for DCIS',
					'Scarff-Bloom-Richardson grading system',
					'Three-tier grading system',
					'Two-tier grading system',
					'WHO grading system for CNS tumours',
				],
			},
		},
		{
			name: 'tumour_grade',
			valueType: 'string',
			displayName: 'Tumour Grade',
			description: 'Grade of the tumour as assigned by the reporting tumour_grading_system.',
			restrictions: {
				codeList: [
					'Low grade',
					'High grade',
					'GX',
					'G1',
					'G2',
					'G3',
					'G4',
					'Low',
					'High',
					'Intermediate',
					'Very low',
					'Grade I',
					'Grade II',
					'Grade III',
					'Grade IV',
					'Grade Group 1',
					'Grade Group 2',
					'Grade Group 3',
					'Grade Group 4',
					'Grade Group 5',
				],
			},
		},
		{
			name: 'percent_tumour_cells',
			valueType: 'number',
			displayName: 'Percent Tumour Cells',
			description: 'Proportion of tumour cells compared to total cells in the specimen (0.0–1.0).',
			restrictions: { range: { min: 0, max: 1 } },
		},
		{
			name: 'percent_tumour_cells_measurement_method',
			valueType: 'string',
			displayName: 'Percent Tumour Cells Measurement Method',
			description: 'Method used to measure percent_tumour_cells.',
			restrictions: {
				codeList: ['Genomics', 'Image analysis', 'Pathology estimate by percent nuclei'],
			},
		},
		{
			name: 'percent_proliferating_cells',
			valueType: 'number',
			displayName: 'Percent Proliferating Cells',
			description: 'Proportion of proliferating cells determined during pathologic review of the specimen (0.0–1.0).',
			restrictions: { range: { min: 0, max: 1 } },
		},
		{
			name: 'percent_inflammatory_tissue',
			valueType: 'number',
			displayName: 'Percent Inflammatory Tissue',
			description: 'Proportion of the specimen positive for inflammatory markers (0.0–1.0).',
			restrictions: { range: { min: 0, max: 1 } },
		},
		{
			name: 'percent_stromal_cells',
			valueType: 'number',
			displayName: 'Percent Stromal Cells',
			description: 'Proportion of reactive non-malignant cells in the tumour specimen (0.0–1.0).',
			restrictions: { range: { min: 0, max: 1 } },
		},
		{
			name: 'percent_necrosis',
			valueType: 'number',
			displayName: 'Percent Necrosis',
			description: 'Proportion of cells undergoing necrosis in the tumour specimen (0.0–1.0).',
			restrictions: { range: { min: 0, max: 1 } },
		},
	],
	restrictions: {
		uniqueKey: ['program_id', 'submitter_donor_id', 'submitter_specimen_id'],
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
		],
	},
} as const satisfies Schema;

assertSchema(schemaSpecimen, Schema, 'schemaSpecimen is not a valid Schema');
