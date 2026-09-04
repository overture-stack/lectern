import { Dictionary } from '@overture-stack/lectern-dictionary';
import { assertSchema } from '../assertSchema';
import { schemaCohort } from './schemaCohort';
import { schemaEnrollment } from './schemaEnrollment';
import { schemaInstitution } from './schemaInstitution';
import { schemaLab } from './schemaLab';
import { schemaObservation } from './schemaObservation';
import { schemaProgram } from './schemaProgram';
import { schemaStudy } from './schemaStudy';

// Relationship map:
//   program → study → cohort          (three-level chain)
//   institution → lab                 (isolated network)
//   enrollment → study, institution   (FK to two different parents)
//   observation → cohort (id+group)   (multi-field FK)
export const dictionaryMultiRelationship = {
	name: 'dictionary-multi-relationship',
	version: '1.0',
	displayName: 'Multi-Entity Relationships',
	description:
		'An illustrative example of foreign key relationship patterns across multiple schemas. Not intended for production use.',
	schemas: [schemaProgram, schemaStudy, schemaInstitution, schemaLab, schemaCohort, schemaEnrollment, schemaObservation],
} as const satisfies Dictionary;

assertSchema(dictionaryMultiRelationship, Dictionary, 'dictionaryMultiRelationship is not a valid Dictionary');
