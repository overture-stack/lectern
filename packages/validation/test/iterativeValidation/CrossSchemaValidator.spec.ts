import { expect } from 'chai';
import { CrossSchemaValidator } from '../../src/iterativeValidation/CrossSchemaValidator';
import { assertFailure, assertSuccess } from '../assertResult';
import { dictionaryForeignKeySimple } from '../fixtures/dictionaries/foreignKey/dictionaryForeignKeySimple';
import { dictionaryMultipleSchemasNoRestrictions } from '../fixtures/dictionaries/dictionaryMultipleSchemasNoRestrictions';
import { dictionaryTwoChildSchemasOneForeignParent } from '../fixtures/dictionaries/foreignKey/dictionaryTwoChildSchemasOneForeignParent';

// Schema names used in dictionaryForeignKeySimple
const PARENT_SCHEMA = 'all-data-types';
const CHILD_SCHEMA = 'string-matching-foreign-string';

// Field names
const PARENT_FIELD = 'any-string';
const CHILD_FIELD = 'string-with-foreign-key';

describe('CrossSchemaValidator', () => {
	describe('lifecycle behaviour', () => {
		it('report() with no records submitted returns valid', () => {
			const validator = new CrossSchemaValidator(dictionaryForeignKeySimple);
			const report = validator.report();
			expect(report.valid).to.be.true;
		});

		it('report() called multiple times with no submissions between calls returns the same result', () => {
			const validator = new CrossSchemaValidator(dictionaryForeignKeySimple);
			validator.submit(CHILD_SCHEMA, { id: 'c1', data: { [CHILD_FIELD]: 'missing' } });

			const firstReport = validator.report();
			const secondReport = validator.report();
			expect(firstReport).to.deep.equal(secondReport);
		});

		it('submit() called after report() is reflected in the next report()', () => {
			const validator = new CrossSchemaValidator(dictionaryForeignKeySimple);
			validator.submit(PARENT_SCHEMA, { id: 'p1', data: { [PARENT_FIELD]: 'alpha' } });
			validator.submit(CHILD_SCHEMA, { id: 'c1', data: { [CHILD_FIELD]: 'alpha' } });

			const firstReport = validator.report();
			expect(firstReport.valid).to.be.true;

			validator.submit(CHILD_SCHEMA, { id: 'c2', data: { [CHILD_FIELD]: 'missing-value' } });

			const secondReport = validator.report();
			expect(secondReport.valid).to.be.false;
		});

		it('single-entry submit and array submit with the same records produce identical report results', () => {
			const validatorSingle = new CrossSchemaValidator(dictionaryForeignKeySimple);
			validatorSingle.submit(CHILD_SCHEMA, { id: 'c1', data: { [CHILD_FIELD]: 'missing' } });
			validatorSingle.submit(CHILD_SCHEMA, { id: 'c2', data: { [CHILD_FIELD]: 'also-missing' } });

			const validatorBatch = new CrossSchemaValidator(dictionaryForeignKeySimple);
			validatorBatch.submit(CHILD_SCHEMA, [
				{ id: 'c1', data: { [CHILD_FIELD]: 'missing' } },
				{ id: 'c2', data: { [CHILD_FIELD]: 'also-missing' } },
			]);

			expect(validatorSingle.report()).to.deep.equal(validatorBatch.report());
		});
	});

	describe('submit() return value', () => {
		it('returns success for a known schema with a new id', () => {
			const validator = new CrossSchemaValidator(dictionaryForeignKeySimple);
			const result = validator.submit(PARENT_SCHEMA, { id: 'p1', data: { [PARENT_FIELD]: 'alpha' } });
			assertSuccess(result);
		});

		it('returns UNKNOWN_SCHEMA failure for a schema name not in the dictionary', () => {
			const validator = new CrossSchemaValidator(dictionaryForeignKeySimple);
			const result = validator.submit('not-a-real-schema', { id: 'r1', data: {} });
			assertFailure(result);
			expect(result.data.error).to.equal('UNKNOWN_SCHEMA');
		});

		it('UNKNOWN_SCHEMA failure does not affect report()', () => {
			const validator = new CrossSchemaValidator(dictionaryForeignKeySimple);
			validator.submit('not-a-real-schema', { id: 'r1', data: {} });
			const report = validator.report();
			expect(report.valid).to.be.true;
		});

		it('returns DUPLICATE_ID failure when the same id is submitted twice to the same schema', () => {
			const validator = new CrossSchemaValidator(dictionaryForeignKeySimple);
			validator.submit(PARENT_SCHEMA, { id: 'p1', data: { [PARENT_FIELD]: 'alpha' } });
			const result = validator.submit(PARENT_SCHEMA, { id: 'p1', data: { [PARENT_FIELD]: 'beta' } });
			assertFailure(result);
			expect(result.data.error).to.equal('DUPLICATE_ID');
		});

		it('the same id submitted to two different schemas both return success (IDs are per-schema)', () => {
			const validator = new CrossSchemaValidator(dictionaryForeignKeySimple);
			const result1 = validator.submit(PARENT_SCHEMA, { id: 'shared-id', data: { [PARENT_FIELD]: 'alpha' } });
			const result2 = validator.submit(CHILD_SCHEMA, { id: 'shared-id', data: { [CHILD_FIELD]: 'alpha' } });
			assertSuccess(result1);
			assertSuccess(result2);
		});

		it('returns DUPLICATE_ID for a batch where two entries share the same id', () => {
			const validator = new CrossSchemaValidator(dictionaryForeignKeySimple);
			const result = validator.submit(PARENT_SCHEMA, [
				{ id: 'p1', data: { [PARENT_FIELD]: 'alpha' } },
				{ id: 'p1', data: { [PARENT_FIELD]: 'beta' } },
			]);
			assertFailure(result);
			expect(result.data.error).to.equal('DUPLICATE_ID');
		});

		it('returns LOCKED failure while errors() generator is active', () => {
			const validator = new CrossSchemaValidator(dictionaryForeignKeySimple);
			validator.submit(CHILD_SCHEMA, { id: 'c1', data: { [CHILD_FIELD]: 'missing' } });

			const generator = validator.errors();
			generator.next();

			const result = validator.submit(PARENT_SCHEMA, { id: 'p1', data: { [PARENT_FIELD]: 'alpha' } });
			assertFailure(result);
			expect(result.data.error).to.equal('LOCKED');

			generator.return(undefined);
		});

		it('submit() succeeds after errors() generator is fully consumed', () => {
			const validator = new CrossSchemaValidator(dictionaryForeignKeySimple);
			validator.submit(CHILD_SCHEMA, { id: 'c1', data: { [CHILD_FIELD]: 'missing' } });

			[...validator.errors()];

			const result = validator.submit(PARENT_SCHEMA, { id: 'p1', data: { [PARENT_FIELD]: 'alpha' } });
			assertSuccess(result);
		});
	});

	describe('reference data accumulation', () => {
		it('submitting parent records only returns valid (no child records means no FK checks)', () => {
			const validator = new CrossSchemaValidator(dictionaryForeignKeySimple);
			validator.submit(PARENT_SCHEMA, { id: 'p1', data: { [PARENT_FIELD]: 'alpha' } });
			validator.submit(PARENT_SCHEMA, { id: 'p2', data: { [PARENT_FIELD]: 'beta' } });
			const report = validator.report();
			expect(report.valid).to.be.true;
		});

		it('submitting child records only returns invalid — all referencing values are missing from the empty parent set', () => {
			const validator = new CrossSchemaValidator(dictionaryForeignKeySimple);
			validator.submit(CHILD_SCHEMA, { id: 'c1', data: { [CHILD_FIELD]: 'alpha' } });
			validator.submit(CHILD_SCHEMA, { id: 'c2', data: { [CHILD_FIELD]: 'beta' } });
			const report = validator.report();
			expect(report.valid).to.be.false;
			if (!report.valid) {
				expect(report.details.foreignKey[0]?.counts[0]?.count).to.equal(2);
			}
		});

		it('parent records submitted after child records are still used when report() is called', () => {
			const validator = new CrossSchemaValidator(dictionaryForeignKeySimple);
			// Submit child first
			validator.submit(CHILD_SCHEMA, { id: 'c1', data: { [CHILD_FIELD]: 'alpha' } });
			// Submit parent after
			validator.submit(PARENT_SCHEMA, { id: 'p1', data: { [PARENT_FIELD]: 'alpha' } });

			const report = validator.report();
			expect(report.valid).to.be.true;
		});
	});

	describe('foreignKey constraint', () => {
		it('returns valid when all referencing field values exist in the parent reference set', () => {
			const validator = new CrossSchemaValidator(dictionaryForeignKeySimple);
			validator.submit(PARENT_SCHEMA, { id: 'p1', data: { [PARENT_FIELD]: 'alpha' } });
			validator.submit(PARENT_SCHEMA, { id: 'p2', data: { [PARENT_FIELD]: 'beta' } });
			validator.submit(CHILD_SCHEMA, { id: 'c1', data: { [CHILD_FIELD]: 'alpha' } });
			validator.submit(CHILD_SCHEMA, { id: 'c2', data: { [CHILD_FIELD]: 'beta' } });

			const report = validator.report();
			expect(report.valid).to.be.true;
		});

		it('returns invalid with count 1 when one child record has a value not in the parent set', () => {
			const validator = new CrossSchemaValidator(dictionaryForeignKeySimple);
			validator.submit(PARENT_SCHEMA, { id: 'p1', data: { [PARENT_FIELD]: 'alpha' } });
			validator.submit(CHILD_SCHEMA, { id: 'c1', data: { [CHILD_FIELD]: 'not-in-parent' } });

			const report = validator.report();
			expect(report.valid).to.be.false;
			if (!report.valid) {
				expect(report.details.foreignKey).to.have.length(1);
				expect(report.details.foreignKey[0]?.schemaName).to.equal(CHILD_SCHEMA);
				expect(report.details.foreignKey[0]?.counts).to.have.length(1);
				expect(report.details.foreignKey[0]?.counts[0]?.localField).to.equal(CHILD_FIELD);
				expect(report.details.foreignKey[0]?.counts[0]?.foreignSchema).to.equal(PARENT_SCHEMA);
				expect(report.details.foreignKey[0]?.counts[0]?.foreignField).to.equal(PARENT_FIELD);
				expect(report.details.foreignKey[0]?.counts[0]?.count).to.equal(1);
			}
		});

		it('count accumulates across multiple child records with missing foreign values', () => {
			const validator = new CrossSchemaValidator(dictionaryForeignKeySimple);
			validator.submit(PARENT_SCHEMA, { id: 'p1', data: { [PARENT_FIELD]: 'alpha' } });
			validator.submit(CHILD_SCHEMA, { id: 'c1', data: { [CHILD_FIELD]: 'missing-1' } });
			validator.submit(CHILD_SCHEMA, { id: 'c2', data: { [CHILD_FIELD]: 'missing-2' } });
			validator.submit(CHILD_SCHEMA, { id: 'c3', data: { [CHILD_FIELD]: 'missing-3' } });

			const report = validator.report();
			expect(report.valid).to.be.false;
			if (!report.valid) {
				expect(report.details.foreignKey[0]?.counts[0]?.count).to.equal(3);
			}
		});

		it('a child record with an undefined FK field value does not produce a violation', () => {
			const validator = new CrossSchemaValidator(dictionaryForeignKeySimple);
			// No parent records — if undefined were checked it would always violate
			validator.submit(CHILD_SCHEMA, { id: 'c1', data: {} }); // CHILD_FIELD is undefined

			const report = validator.report();
			expect(report.valid).to.be.true;
		});
	});

	describe('grouping by local schema', () => {
		it('two child schemas with FK to the same parent each appear as separate entries in the foreignKey array', () => {
			const validator = new CrossSchemaValidator(dictionaryTwoChildSchemasOneForeignParent);

			// Both child schemas have violations (no parent records submitted)
			validator.submit('first-child', { id: 'f1', data: { 'first-string-field': 'missing' } });
			validator.submit('second-child', { id: 's1', data: { 'second-string-field': 'missing' } });

			const report = validator.report();
			expect(report.valid).to.be.false;
			if (!report.valid) {
				expect(report.details.foreignKey).to.have.length(2);
				const schemaNames = report.details.foreignKey.map((entry) => entry.schemaName);
				expect(schemaNames).to.include('first-child');
				expect(schemaNames).to.include('second-child');
			}
		});
	});

	describe('dictionary with no foreignKey restrictions', () => {
		it('returns valid when the dictionary has no FK rules', () => {
			const validator = new CrossSchemaValidator(dictionaryMultipleSchemasNoRestrictions);

			for (const schema of dictionaryMultipleSchemasNoRestrictions.schemas) {
				validator.submit(schema.name, { id: 'r1', data: { 'any-string': 'value' } });
			}

			const report = validator.report();
			expect(report.valid).to.be.true;
		});
	});

	describe('errors() generator', () => {
		it('yields no errors when all child records satisfy FK constraints', () => {
			const validator = new CrossSchemaValidator(dictionaryForeignKeySimple);
			validator.submit(PARENT_SCHEMA, { id: 'p1', data: { [PARENT_FIELD]: 'alpha' } });
			validator.submit(CHILD_SCHEMA, { id: 'c1', data: { [CHILD_FIELD]: 'alpha' } });

			const errors = [...validator.errors()];
			expect(errors).to.have.length(0);
		});

		it('yields one error per FK violation', () => {
			const validator = new CrossSchemaValidator(dictionaryForeignKeySimple);
			validator.submit(CHILD_SCHEMA, { id: 'c1', data: { [CHILD_FIELD]: 'missing-1' } });
			validator.submit(CHILD_SCHEMA, { id: 'c2', data: { [CHILD_FIELD]: 'missing-2' } });

			const errors = [...validator.errors()];
			expect(errors).to.have.length(2);
			expect(errors.every((error) => error.reason === 'INVALID_BY_FOREIGNKEY')).to.be.true;
		});

		it('each yielded error includes the record id and schema name', () => {
			const validator = new CrossSchemaValidator(dictionaryForeignKeySimple);
			validator.submit(CHILD_SCHEMA, { id: 'child-record-1', data: { [CHILD_FIELD]: 'missing' } });

			const errors = [...validator.errors()];
			expect(errors).to.have.length(1);
			expect(errors[0]?.id).to.equal('child-record-1');
			expect(errors[0]?.schemaName).to.equal(CHILD_SCHEMA);
		});
	});
});
