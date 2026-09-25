import { expect } from 'chai';
import { DictionaryValidator } from '../../src/iterativeValidation/DictionaryValidator';
import { assertFailure, assertSuccess } from '../assertResult';
import { dictionaryForeignKeySimple } from '../fixtures/dictionaries/foreignKey/dictionaryForeignKeySimple';
import { dictionaryMultipleSchemasNoRestrictions } from '../fixtures/dictionaries/dictionaryMultipleSchemasNoRestrictions';
import { dictionaryUniqueParentWithFkChild } from '../fixtures/dictionaries/dictionaryUniqueParentWithFkChild';

// Schema names in dictionaryForeignKeySimple
const FK_PARENT = 'all-data-types';
const FK_CHILD = 'string-matching-foreign-string';
const FK_PARENT_FIELD = 'any-string';
const FK_CHILD_FIELD = 'string-with-foreign-key';

// Schema names in dictionaryUniqueParentWithFkChild
const UNIQUE_PARENT = 'unique-parent';
const FK_CHILD_2 = 'fk-child';

describe('DictionaryValidator', () => {
	describe('lifecycle behaviour', () => {
		it('report() with no records submitted returns valid', () => {
			const validator = new DictionaryValidator(dictionaryForeignKeySimple);
			const report = validator.report();
			expect(report.valid).to.be.true;
		});

		it('report() called multiple times with no submissions between calls returns the same result', () => {
			const validator = new DictionaryValidator(dictionaryForeignKeySimple);
			validator.submit(FK_CHILD, { id: 'c1', data: { [FK_CHILD_FIELD]: 'missing' } });

			const firstReport = validator.report();
			const secondReport = validator.report();
			expect(firstReport).to.deep.equal(secondReport);
		});

		it('submit() called after report() is reflected in the next report()', () => {
			const validator = new DictionaryValidator(dictionaryForeignKeySimple);
			validator.submit(FK_PARENT, { id: 'p1', data: { [FK_PARENT_FIELD]: 'alpha' } });
			validator.submit(FK_CHILD, { id: 'c1', data: { [FK_CHILD_FIELD]: 'alpha' } });

			const firstReport = validator.report();
			expect(firstReport.valid).to.be.true;

			validator.submit(FK_CHILD, { id: 'c2', data: { [FK_CHILD_FIELD]: 'missing-value' } });

			const secondReport = validator.report();
			expect(secondReport.valid).to.be.false;
		});

		it('records for different schemas submitted interleaved produce the same report as submitting all records per schema sequentially', () => {
			const validatorInterleaved = new DictionaryValidator(dictionaryForeignKeySimple);
			validatorInterleaved.submit(FK_PARENT, { id: 'p1', data: { [FK_PARENT_FIELD]: 'alpha' } });
			validatorInterleaved.submit(FK_CHILD, { id: 'c1', data: { [FK_CHILD_FIELD]: 'alpha' } });
			validatorInterleaved.submit(FK_PARENT, { id: 'p2', data: { [FK_PARENT_FIELD]: 'beta' } });
			validatorInterleaved.submit(FK_CHILD, { id: 'c2', data: { [FK_CHILD_FIELD]: 'beta' } });

			const validatorSequential = new DictionaryValidator(dictionaryForeignKeySimple);
			validatorSequential.submit(FK_PARENT, [
				{ id: 'p1', data: { [FK_PARENT_FIELD]: 'alpha' } },
				{ id: 'p2', data: { [FK_PARENT_FIELD]: 'beta' } },
			]);
			validatorSequential.submit(FK_CHILD, [
				{ id: 'c1', data: { [FK_CHILD_FIELD]: 'alpha' } },
				{ id: 'c2', data: { [FK_CHILD_FIELD]: 'beta' } },
			]);

			expect(validatorInterleaved.report()).to.deep.equal(validatorSequential.report());
		});
	});

	describe('submit() return value', () => {
		it('returns success with an entry per submitted record when all records are valid', () => {
			const validator = new DictionaryValidator(dictionaryMultipleSchemasNoRestrictions);
			const result = validator.submit('single-string', [
				{ id: 'r1', data: { 'any-string': 'alpha' } },
				{ id: 'r2', data: { 'any-string': 'beta' } },
			]);
			assertSuccess(result);
			expect(result.data).to.have.length(2);
			expect(result.data[0]?.valid).to.be.true;
			expect(result.data[1]?.valid).to.be.true;
		});

		it('entry for a record with an invalid field value has valid: false with details', () => {
			const validator = new DictionaryValidator(dictionaryUniqueParentWithFkChild);
			// required-field is missing
			const result = validator.submit(FK_CHILD_2, { id: 'c1', data: { 'parent-ref': 'some-ref' } });
			assertSuccess(result);
			expect(result.data[0]?.valid).to.be.false;
			if (result.data[0] && !result.data[0].valid) {
				expect(result.data[0].details).to.have.length.greaterThan(0);
			}
		});

		it('id in each data entry matches the id supplied in the submit() entry', () => {
			const validator = new DictionaryValidator(dictionaryUniqueParentWithFkChild);
			const result = validator.submit(FK_CHILD_2, [
				{ id: 'record-a', data: { 'parent-ref': 'ref', 'required-field': 'value' } },
				{ id: 'record-b', data: {} }, // missing required-field
			]);
			assertSuccess(result);
			expect(result.data[0]?.id).to.equal('record-a');
			expect(result.data[1]?.id).to.equal('record-b');
		});

		it('returns UNKNOWN_SCHEMA failure for a schema name not in the dictionary', () => {
			const validator = new DictionaryValidator(dictionaryForeignKeySimple);
			const result = validator.submit('not-a-real-schema', { id: 'r1', data: {} });
			assertFailure(result);
			expect(result.data.error).to.equal('UNKNOWN_SCHEMA');
		});

		it('returns DUPLICATE_ID failure when the same id is submitted twice to the same schema', () => {
			const validator = new DictionaryValidator(dictionaryForeignKeySimple);
			validator.submit(FK_PARENT, { id: 'p1', data: { [FK_PARENT_FIELD]: 'alpha' } });
			const result = validator.submit(FK_PARENT, { id: 'p1', data: { [FK_PARENT_FIELD]: 'beta' } });
			assertFailure(result);
			expect(result.data.error).to.equal('DUPLICATE_ID');
		});

		it('the same id submitted to two different schemas both return success (IDs are per-schema)', () => {
			const validator = new DictionaryValidator(dictionaryForeignKeySimple);
			const result1 = validator.submit(FK_PARENT, { id: 'shared-id', data: { [FK_PARENT_FIELD]: 'alpha' } });
			const result2 = validator.submit(FK_CHILD, { id: 'shared-id', data: { [FK_CHILD_FIELD]: 'alpha' } });
			assertSuccess(result1);
			assertSuccess(result2);
		});

		it('returns LOCKED failure while errors() generator is active', () => {
			const validator = new DictionaryValidator(dictionaryForeignKeySimple);
			validator.submit(FK_CHILD, { id: 'c1', data: { [FK_CHILD_FIELD]: 'missing' } });

			const generator = validator.errors();
			generator.next();

			const result = validator.submit(FK_PARENT, { id: 'p1', data: { [FK_PARENT_FIELD]: 'alpha' } });
			assertFailure(result);
			expect(result.data.error).to.equal('LOCKED');

			generator.return(undefined);
		});

		it('submit() succeeds after errors() generator is fully consumed', () => {
			const validator = new DictionaryValidator(dictionaryForeignKeySimple);
			validator.submit(FK_CHILD, { id: 'c1', data: { [FK_CHILD_FIELD]: 'missing' } });

			[...validator.errors()];

			const result = validator.submit(FK_PARENT, { id: 'p1', data: { [FK_PARENT_FIELD]: 'alpha' } });
			assertSuccess(result);
		});
	});

	describe('report() counts', () => {
		it('returns valid when all submitted records pass all constraints', () => {
			const validator = new DictionaryValidator(dictionaryForeignKeySimple);
			validator.submit(FK_PARENT, { id: 'p1', data: { [FK_PARENT_FIELD]: 'alpha' } });
			validator.submit(FK_CHILD, { id: 'c1', data: { [FK_CHILD_FIELD]: 'alpha' } });
			const report = validator.report();
			expect(report.valid).to.be.true;
		});

		it('UNKNOWN_SCHEMA submissions increment unknownSchemaCount and make the report invalid', () => {
			const validator = new DictionaryValidator(dictionaryForeignKeySimple);
			validator.submit('unknown-schema-1', { id: 'r1', data: {} });
			validator.submit('unknown-schema-2', { id: 'r2', data: {} });

			const report = validator.report();
			expect(report.valid).to.be.false;
			if (!report.valid) {
				expect(report.details.unknownSchemaCount).to.equal(2);
			}
		});

		it('duplicate submissions do not increment recordCount', () => {
			const validator = new DictionaryValidator(dictionaryUniqueParentWithFkChild);
			// Submit with a missing required field so we can access report details
			validator.submit(FK_CHILD_2, { id: 'c1', data: {} }); // invalid — forces report to be invalid
			validator.submit(FK_CHILD_2, { id: 'c1', data: {} }); // duplicate — should not be counted

			const report = validator.report();
			expect(report.valid).to.be.false;
			if (!report.valid) {
				expect(report.details.schemaCounts[FK_CHILD_2]?.recordCount).to.equal(1);
			}
		});

		it('recordCount and recordErrorCount reflect only the records for each schema', () => {
			const validator = new DictionaryValidator(dictionaryUniqueParentWithFkChild);
			validator.submit(UNIQUE_PARENT, { id: 'p1', data: { 'parent-id': 'alpha' } }); // valid
			validator.submit(FK_CHILD_2, { id: 'c1', data: { 'required-field': 'x', 'parent-ref': 'alpha' } }); // valid
			validator.submit(FK_CHILD_2, { id: 'c2', data: {} }); // invalid — missing required-field

			const report = validator.report();
			expect(report.valid).to.be.false;
			if (!report.valid) {
				expect(report.details.schemaCounts[UNIQUE_PARENT]?.recordCount).to.equal(1);
				expect(report.details.schemaCounts[UNIQUE_PARENT]?.recordErrorCount).to.equal(0);
				expect(report.details.schemaCounts[FK_CHILD_2]?.recordCount).to.equal(2);
				expect(report.details.schemaCounts[FK_CHILD_2]?.recordErrorCount).to.equal(1);
			}
		});

		it('unique violation in schema A is reflected in schemaCounts.A.errorCounts.unique; schema B is unaffected', () => {
			const validator = new DictionaryValidator(dictionaryUniqueParentWithFkChild);
			// Submit two records with the same parent-id (unique violation in UNIQUE_PARENT)
			validator.submit(UNIQUE_PARENT, { id: 'p1', data: { 'parent-id': 'dup' } });
			validator.submit(UNIQUE_PARENT, { id: 'p2', data: { 'parent-id': 'dup' } });
			// Submit a valid child record
			validator.submit(FK_CHILD_2, { id: 'c1', data: { 'parent-ref': 'dup', 'required-field': 'x' } });

			const report = validator.report();
			expect(report.valid).to.be.false;
			if (!report.valid) {
				expect(report.details.schemaCounts[UNIQUE_PARENT]?.errorCounts.unique).to.have.length(1);
				expect(report.details.schemaCounts[UNIQUE_PARENT]?.errorCounts.unique[0]?.count).to.equal(2);
				expect(report.details.schemaCounts[FK_CHILD_2]?.errorCounts.unique).to.deep.equal([]);
			}
		});

		it('FK violation in schema B is reflected in schemaCounts.B.errorCounts.foreignKey', () => {
			const validator = new DictionaryValidator(dictionaryUniqueParentWithFkChild);
			validator.submit(UNIQUE_PARENT, { id: 'p1', data: { 'parent-id': 'alpha' } });
			// child references a value that does not exist in the parent
			validator.submit(FK_CHILD_2, { id: 'c1', data: { 'parent-ref': 'missing', 'required-field': 'x' } });

			const report = validator.report();
			expect(report.valid).to.be.false;
			if (!report.valid) {
				expect(report.details.schemaCounts[FK_CHILD_2]?.errorCounts.foreignKey).to.have.length(1);
				expect(report.details.schemaCounts[FK_CHILD_2]?.errorCounts.foreignKey[0]?.count).to.equal(1);
				expect(report.details.schemaCounts[UNIQUE_PARENT]?.errorCounts.foreignKey).to.deep.equal([]);
			}
		});

		it('combined: unique violation in parent, FK violation in child, and record-level error in child', () => {
			const validator = new DictionaryValidator(dictionaryUniqueParentWithFkChild);

			// Unique violation: two parent records with the same parent-id
			validator.submit(UNIQUE_PARENT, { id: 'p1', data: { 'parent-id': 'dup' } });
			validator.submit(UNIQUE_PARENT, { id: 'p2', data: { 'parent-id': 'dup' } });

			// Child record: missing required-field (record-level error) and referencing a missing parent (FK violation)
			const childResult = validator.submit(FK_CHILD_2, { id: 'c1', data: { 'parent-ref': 'not-in-parent' } });

			// Record-level error is returned directly from submit()
			assertSuccess(childResult);
			expect(childResult.data[0]?.valid).to.be.false;

			const report = validator.report();
			expect(report.valid).to.be.false;
			if (!report.valid) {
				// Unique violation in parent
				expect(report.details.schemaCounts[UNIQUE_PARENT]?.errorCounts.unique).to.have.length(1);
				// Record-level error in child
				expect(report.details.schemaCounts[FK_CHILD_2]?.recordErrorCount).to.equal(1);
				// FK violation in child
				expect(report.details.schemaCounts[FK_CHILD_2]?.errorCounts.foreignKey).to.have.length(1);
			}
		});
	});

	describe('errors() generator', () => {
		it('yields no errors when all records satisfy all constraints', () => {
			const validator = new DictionaryValidator(dictionaryForeignKeySimple);
			validator.submit(FK_PARENT, { id: 'p1', data: { [FK_PARENT_FIELD]: 'alpha' } });
			validator.submit(FK_CHILD, { id: 'c1', data: { [FK_CHILD_FIELD]: 'alpha' } });

			const errors = [...validator.errors()];
			expect(errors).to.have.length(0);
		});

		it('yields cross-record unique violation errors for schemas with unique constraints', () => {
			const validator = new DictionaryValidator(dictionaryUniqueParentWithFkChild);
			validator.submit(UNIQUE_PARENT, { id: 'p1', data: { 'parent-id': 'dup' } });
			validator.submit(UNIQUE_PARENT, { id: 'p2', data: { 'parent-id': 'dup' } });

			const errors = [...validator.errors()];
			expect(errors).to.have.length(2);
			expect(errors.every((error) => error.reason === 'INVALID_BY_UNIQUE')).to.be.true;
		});

		it('yields FK violation errors for schemas with foreignKey constraints', () => {
			const validator = new DictionaryValidator(dictionaryUniqueParentWithFkChild);
			validator.submit(FK_CHILD_2, { id: 'c1', data: { 'parent-ref': 'missing', 'required-field': 'x' } });

			const errors = [...validator.errors()];
			expect(errors).to.have.length(1);
			expect(errors[0]?.reason).to.equal('INVALID_BY_FOREIGNKEY');
		});
	});
});
