import { Dictionary } from '@overture-stack/lectern-dictionary';
import { assertSchema } from '../assertSchema';
import { cancerGenomicsReferences } from './references';
import { schemaComorbidity } from './schemaComorbidity';
import { schemaDonor } from './schemaDonor';
import { schemaExposure } from './schemaExposure';
import { schemaFollowUp } from './schemaFollowUp';
import { schemaPrimaryDiagnosis } from './schemaPrimaryDiagnosis';
import { schemaSpecimen } from './schemaSpecimen';
import { schemaTreatment } from './schemaTreatment';

// Representative cancer genomics data model for tracking participant data for a cancer research program.
// Clinical hierarchy: donor → primary_diagnosis → specimen + treatment + follow_up; donor → exposure + comorbidity.
export const dictionaryCancerGenomics = {
	name: 'dictionary-cancer-genomics',
	version: '1.0',
	displayName: 'Cancer Genomics',
	description: 'A data dictionary for tracking participant data for a cancer research program.',
	references: cancerGenomicsReferences,
	schemas: [
		schemaDonor,
		schemaPrimaryDiagnosis,
		schemaSpecimen,
		schemaTreatment,
		schemaFollowUp,
		schemaExposure,
		schemaComorbidity,
	],
} as const satisfies Dictionary;

assertSchema(dictionaryCancerGenomics, Dictionary, 'dictionaryCancerGenomics is not a valid Dictionary');
