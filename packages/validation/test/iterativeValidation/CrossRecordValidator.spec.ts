import { expect } from 'chai';
import { CrossRecordValidator } from '../../src/iterativeValidation/CrossRecordValidator';
import { schemaAllDataTypes } from '../fixtures/schema/schemaAllDataTypes';
import { schemaSingleString } from '../fixtures/schema/schemaSingleString';
import { schemaTwoUniqueFields } from '../fixtures/schema/schemaTwoUniqueFields';
import { schemaUniqueFieldAndUniqueKey } from '../fixtures/schema/schemaUniqueFieldAndUniqueKey';
import { schemaUniqueKey } from '../fixtures/schema/schemaUniqueKey';
import { schemaUniqueString } from '../fixtures/schema/schemaUniqueString';
import { assertFailure, assertSuccess } from '../assertResult';

describe('CrossRecordValidator', () => {
	describe('lifecycle behaviour', () => {
		it('report() with no records submitted returns valid with all counts zero', () => {
			const validator = new CrossRecordValidator(schemaUniqueString);
			const report = validator.report();
			expect(report.valid).to.be.true;
			expect(report.recordCount).to.equal(0);
			expect(report.errorCounts.unique).to.deep.equal([]);
			expect(report.errorCounts.uniqueKey).to.equal(0);
		});

		it('report() called multiple times with no submissions between calls returns the same result', () => {
			const validator = new CrossRecordValidator(schemaUniqueString);
			validator.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });
			validator.submit({ id: 'r2', data: { 'unique-string': 'alpha' } });

			const firstReport = validator.report();
			const secondReport = validator.report();
			expect(firstReport).to.deep.equal(secondReport);
		});

		it('submit() called after report() is reflected in the next report()', () => {
			const validator = new CrossRecordValidator(schemaUniqueString);
			validator.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });

			const firstReport = validator.report();
			expect(firstReport.valid).to.be.true;
			expect(firstReport.recordCount).to.equal(1);

			validator.submit({ id: 'r2', data: { 'unique-string': 'alpha' } });

			const secondReport = validator.report();
			expect(secondReport.valid).to.be.false;
			expect(secondReport.recordCount).to.equal(2);
		});

		it('single-entry submit and array submit with the same record produce identical report results', () => {
			const validatorSingle = new CrossRecordValidator(schemaUniqueString);
			validatorSingle.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });
			validatorSingle.submit({ id: 'r2', data: { 'unique-string': 'alpha' } });

			const validatorBatch = new CrossRecordValidator(schemaUniqueString);
			validatorBatch.submit([
				{ id: 'r1', data: { 'unique-string': 'alpha' } },
				{ id: 'r2', data: { 'unique-string': 'alpha' } },
			]);

			expect(validatorSingle.report()).to.deep.equal(validatorBatch.report());
		});
	});

	describe('submit() return value', () => {
		it('returns success for a new id', () => {
			const validator = new CrossRecordValidator(schemaUniqueString);
			const result = validator.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });
			assertSuccess(result);
			const result2 = validator.submit({ id: 'r2', data: { 'unique-string': 'alpha' } });
			assertSuccess(result2);
		});

		it('returns DUPLICATE_ID failure when the same id is submitted twice with identical data', () => {
			const validator = new CrossRecordValidator(schemaUniqueString);
			validator.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });
			const result = validator.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });
			assertFailure(result);
			expect(result.data.error).to.equal('DUPLICATE_ID');
		});

		it('returns DUPLICATE_ID failure when the same id is submitted twice with different data', () => {
			const validator = new CrossRecordValidator(schemaUniqueString);
			validator.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });
			const result = validator.submit({ id: 'r1', data: { 'unique-string': 'beta' } });
			assertFailure(result);
			expect(result.data.error).to.equal('DUPLICATE_ID');
		});

		it('duplicate is counted once in the index when submitted twice with identical data', () => {
			const validator = new CrossRecordValidator(schemaUniqueString);
			validator.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });
			validator.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });

			const report = validator.report();
			expect(report.recordCount).to.equal(1);
		});

		it('returns DUPLICATE_ID failure for a batch where two entries share the same id', () => {
			const validator = new CrossRecordValidator(schemaUniqueString);
			const result = validator.submit([
				{ id: 'r1', data: { 'unique-string': 'alpha' } },
				{ id: 'r1', data: { 'unique-string': 'beta' } },
			]);
			assertFailure(result);
			expect(result.data.error).to.equal('DUPLICATE_ID');
		});
	});

	describe('unique field constraint', () => {
		it('report() returns valid for a schema with no unique fields', () => {
			const validator = new CrossRecordValidator(schemaSingleString);
			validator.submit({ id: 'r1', data: { 'any-string': 'alpha' } });
			validator.submit({ id: 'r2', data: { 'any-string': 'alpha' } });
			const report = validator.report();
			expect(report.valid).to.be.true;
			expect(report.errorCounts.unique).to.deep.equal([]);
		});

		it('report() returns valid when all records have distinct values for a unique field', () => {
			const validator = new CrossRecordValidator(schemaUniqueString);
			validator.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });
			validator.submit({ id: 'r2', data: { 'unique-string': 'beta' } });
			validator.submit({ id: 'r3', data: { 'unique-string': 'gamma' } });
			const report = validator.report();
			expect(report.valid).to.be.true;
			expect(report.errorCounts.unique).to.deep.equal([]);
		});

		it('report() returns invalid with count 2 when two records share the same unique field value', () => {
			const validator = new CrossRecordValidator(schemaUniqueString);
			validator.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });
			validator.submit({ id: 'r2', data: { 'unique-string': 'alpha' } });
			const report = validator.report();
			expect(report.valid).to.be.false;
			expect(report.errorCounts.unique).to.have.length(1);
			expect(report.errorCounts.unique[0]).to.deep.equal({ fieldName: 'unique-string', count: 2 });
		});

		it('count is 3 when three records share the same unique field value', () => {
			const validator = new CrossRecordValidator(schemaUniqueString);
			validator.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });
			validator.submit({ id: 'r2', data: { 'unique-string': 'alpha' } });
			validator.submit({ id: 'r3', data: { 'unique-string': 'alpha' } });
			const report = validator.report();
			expect(report.valid).to.be.false;
			expect(report.errorCounts.unique[0]).to.deep.equal({ fieldName: 'unique-string', count: 3 });
		});

		it('count accumulates records across multiple colliding values for the same field', () => {
			const validator = new CrossRecordValidator(schemaUniqueString);
			// Two records share 'alpha', two share 'beta' — 4 violating records total
			validator.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });
			validator.submit({ id: 'r2', data: { 'unique-string': 'alpha' } });
			validator.submit({ id: 'r3', data: { 'unique-string': 'beta' } });
			validator.submit({ id: 'r4', data: { 'unique-string': 'beta' } });
			const report = validator.report();
			expect(report.valid).to.be.false;
			expect(report.errorCounts.unique[0]).to.deep.equal({ fieldName: 'unique-string', count: 4 });
		});

		it('report() contains one entry per unique field that has violations', () => {
			const validator = new CrossRecordValidator(schemaTwoUniqueFields);
			validator.submit({ id: 'r1', data: { 'field-a': 'x', 'field-b': 'p' } });
			validator.submit({ id: 'r2', data: { 'field-a': 'x', 'field-b': 'q' } });
			// field-a has a collision (both 'x'), field-b does not
			const report = validator.report();
			expect(report.valid).to.be.false;
			expect(report.errorCounts.unique).to.have.length(1);
			expect(report.errorCounts.unique[0]?.fieldName).to.equal('field-a');
		});

		it('report() contains two entries when two different unique fields each have a collision', () => {
			const validator = new CrossRecordValidator(schemaTwoUniqueFields);
			validator.submit({ id: 'r1', data: { 'field-a': 'x', 'field-b': 'p' } });
			validator.submit({ id: 'r2', data: { 'field-a': 'x', 'field-b': 'p' } });
			// both field-a and field-b collide
			const report = validator.report();
			expect(report.valid).to.be.false;
			expect(report.errorCounts.unique).to.have.length(2);
		});

		it('undefined values in a unique field are exempt from the unique constraint', () => {
			const validator = new CrossRecordValidator(schemaUniqueString);
			validator.submit({ id: 'r1', data: { 'unique-string': undefined } });
			validator.submit({ id: 'r2', data: { 'unique-string': undefined } });
			validator.submit({ id: 'r3', data: {} });
			validator.submit({ id: 'r4', data: { 'unique-string': 'alpha' } });
			const report = validator.report();
			expect(report.valid).to.be.true;
		});

		it('records submitted individually vs as a batch produce the same report', () => {
			const validatorIndividual = new CrossRecordValidator(schemaUniqueString);
			validatorIndividual.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });
			validatorIndividual.submit({ id: 'r2', data: { 'unique-string': 'alpha' } });

			const validatorBatch = new CrossRecordValidator(schemaUniqueString);
			validatorBatch.submit([
				{ id: 'r1', data: { 'unique-string': 'alpha' } },
				{ id: 'r2', data: { 'unique-string': 'alpha' } },
			]);

			expect(validatorIndividual.report()).to.deep.equal(validatorBatch.report());
		});
	});

	describe('uniqueKey constraint', () => {
		it('report() returns valid for a schema with no uniqueKey restriction', () => {
			const validator = new CrossRecordValidator(schemaSingleString);
			validator.submit({ id: 'r1', data: { 'any-string': 'alpha' } });
			validator.submit({ id: 'r2', data: { 'any-string': 'alpha' } });
			const report = validator.report();
			expect(report.valid).to.be.true;
			expect(report.errorCounts.uniqueKey).to.equal(0);
		});

		it('report() returns valid when all records have distinct composite key values', () => {
			const validator = new CrossRecordValidator(schemaUniqueKey);
			validator.submit({
				id: 'r1',
				data: { 'any-string': 'a', 'any-number': 1, 'any-integer': 10, 'any-boolean': true },
			});
			validator.submit({
				id: 'r2',
				data: { 'any-string': 'b', 'any-number': 1, 'any-integer': 10, 'any-boolean': true },
			});
			const report = validator.report();
			expect(report.valid).to.be.true;
			expect(report.errorCounts.uniqueKey).to.equal(0);
		});

		it('report() returns invalid with uniqueKey count 2 when two records share the same composite key', () => {
			const sameData = { 'any-string': 'a', 'any-number': 1, 'any-integer': 10, 'any-boolean': true };
			const validator = new CrossRecordValidator(schemaUniqueKey);
			validator.submit({ id: 'r1', data: sameData });
			validator.submit({ id: 'r2', data: sameData });
			const report = validator.report();
			expect(report.valid).to.be.false;
			expect(report.errorCounts.uniqueKey).to.equal(2);
		});

		it('uniqueKey count accumulates records across multiple colliding composite keys', () => {
			const dataA = { 'any-string': 'a', 'any-number': 1, 'any-integer': 10, 'any-boolean': true };
			const dataB = { 'any-string': 'b', 'any-number': 2, 'any-integer': 20, 'any-boolean': false };
			const validator = new CrossRecordValidator(schemaUniqueKey);
			// Two records share composite key A, two records share composite key B → 4 violating records total
			validator.submit({ id: 'r1', data: dataA });
			validator.submit({ id: 'r2', data: dataA });
			validator.submit({ id: 'r3', data: dataB });
			validator.submit({ id: 'r4', data: dataB });
			const report = validator.report();
			expect(report.valid).to.be.false;
			expect(report.errorCounts.uniqueKey).to.equal(4);
		});

		it('report() reflects both unique field and uniqueKey violations when both are present', () => {
			const validator = new CrossRecordValidator(schemaUniqueFieldAndUniqueKey);
			// Two records share the same 'id' value → unique violation on 'id'
			// Two records share the same (category, code) composite key → uniqueKey violation
			validator.submit({ id: 'r1', data: { id: 'dup', category: 'cat1', code: 'A' } });
			validator.submit({ id: 'r2', data: { id: 'dup', category: 'cat1', code: 'A' } });
			const report = validator.report();
			expect(report.valid).to.be.false;
			expect(report.errorCounts.unique).to.have.length(1);
			expect(report.errorCounts.unique[0]).to.deep.equal({ fieldName: 'id', count: 2 });
			expect(report.errorCounts.uniqueKey).to.equal(2);
		});
	});

	describe('schema with no unique constraints', () => {
		it('report() returns valid regardless of duplicate field values when no unique constraints exist', () => {
			const validator = new CrossRecordValidator(schemaAllDataTypes);
			// All records have identical field values — would fail field-level restrictions but CrossRecordValidator ignores those
			validator.submit({ id: 'r1', data: { 'any-string': 'x', 'any-number': 1 } });
			validator.submit({ id: 'r2', data: { 'any-string': 'x', 'any-number': 1 } });
			const report = validator.report();
			expect(report.valid).to.be.true;
			expect(report.errorCounts.unique).to.deep.equal([]);
			expect(report.errorCounts.uniqueKey).to.equal(0);
		});
	});

	describe('errors() generator', () => {
		it('yields no errors when all records are valid', () => {
			const validator = new CrossRecordValidator(schemaUniqueString);
			validator.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });
			validator.submit({ id: 'r2', data: { 'unique-string': 'beta' } });
			const errors = [...validator.errors()];
			expect(errors).to.have.length(0);
		});

		it('yields one error per violating record for a unique field collision', () => {
			const validator = new CrossRecordValidator(schemaUniqueString);
			validator.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });
			validator.submit({ id: 'r2', data: { 'unique-string': 'alpha' } });
			const errors = [...validator.errors()];
			expect(errors).to.have.length(2);
		});

		it('yields INVALID_BY_UNIQUE errors for unique field violations', () => {
			const validator = new CrossRecordValidator(schemaUniqueString);
			validator.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });
			validator.submit({ id: 'r2', data: { 'unique-string': 'alpha' } });
			const errors = [...validator.errors()];
			expect(errors.every((error) => error.reason === 'INVALID_BY_UNIQUE')).to.be.true;
		});

		it('each INVALID_BY_UNIQUE error lists all records in the collision group via matchingRecords', () => {
			const validator = new CrossRecordValidator(schemaUniqueString);
			validator.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });
			validator.submit({ id: 'r2', data: { 'unique-string': 'alpha' } });
			const errors = [...validator.errors()];
			for (const error of errors) {
				expect(error.matchingRecords).to.include('r1');
				expect(error.matchingRecords).to.include('r2');
			}
		});

		it('yields one error per violating record for a uniqueKey collision', () => {
			const sameData = { 'any-string': 'a', 'any-number': 1, 'any-integer': 10, 'any-boolean': true };
			const validator = new CrossRecordValidator(schemaUniqueKey);
			validator.submit({ id: 'r1', data: sameData });
			validator.submit({ id: 'r2', data: sameData });
			const errors = [...validator.errors()];
			expect(errors).to.have.length(2);
		});

		it('yields INVALID_BY_UNIQUE_KEY errors for uniqueKey violations', () => {
			const sameData = { 'any-string': 'a', 'any-number': 1, 'any-integer': 10, 'any-boolean': true };
			const validator = new CrossRecordValidator(schemaUniqueKey);
			validator.submit({ id: 'r1', data: sameData });
			validator.submit({ id: 'r2', data: sameData });
			const errors = [...validator.errors()];
			expect(errors.every((error) => error.reason === 'INVALID_BY_UNIQUE_KEY')).to.be.true;
		});

		it('yields both unique and uniqueKey errors when both constraints are violated', () => {
			const validator = new CrossRecordValidator(schemaUniqueFieldAndUniqueKey);
			validator.submit({ id: 'r1', data: { id: 'dup', category: 'cat1', code: 'A' } });
			validator.submit({ id: 'r2', data: { id: 'dup', category: 'cat1', code: 'A' } });
			const errors = [...validator.errors()];
			const uniqueErrors = errors.filter((error) => error.reason === 'INVALID_BY_UNIQUE');
			const uniqueKeyErrors = errors.filter((error) => error.reason === 'INVALID_BY_UNIQUE_KEY');
			expect(uniqueErrors.length).to.be.greaterThan(0);
			expect(uniqueKeyErrors.length).to.be.greaterThan(0);
		});

		it('errors() and report() reflect the same violations', () => {
			const validator = new CrossRecordValidator(schemaUniqueString);
			validator.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });
			validator.submit({ id: 'r2', data: { 'unique-string': 'alpha' } });
			validator.submit({ id: 'r3', data: { 'unique-string': 'beta' } });
			validator.submit({ id: 'r4', data: { 'unique-string': 'beta' } });
			const errors = [...validator.errors()];
			const report = validator.report();
			// report() counts 4 records (2 in 'alpha' group + 2 in 'beta' group)
			expect(report.errorCounts.unique[0]?.count).to.equal(4);
			// errors() yields one error per violating record
			expect(errors).to.have.length(4);
		});
	});

	describe('LOCKED state', () => {
		it('submit() returns LOCKED failure while errors() generator is running', () => {
			const validator = new CrossRecordValidator(schemaUniqueString);
			validator.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });
			validator.submit({ id: 'r2', data: { 'unique-string': 'alpha' } });

			const generator = validator.errors();
			generator.next(); // start the generator

			const result = validator.submit({ id: 'r3', data: { 'unique-string': 'gamma' } });
			assertFailure(result);
			expect(result.data.error).to.equal('LOCKED');
		});

		it('submit() succeeds after errors() generator is fully consumed', () => {
			const validator = new CrossRecordValidator(schemaUniqueString);
			validator.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });
			validator.submit({ id: 'r2', data: { 'unique-string': 'alpha' } });

			// Fully consume the generator
			[...validator.errors()];

			const result = validator.submit({ id: 'r3', data: { 'unique-string': 'gamma' } });
			expect(result.success).to.be.true;
		});

		it('submit() succeeds after errors() generator is early-terminated via return()', () => {
			const validator = new CrossRecordValidator(schemaUniqueString);
			validator.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });
			validator.submit({ id: 'r2', data: { 'unique-string': 'alpha' } });

			const generator = validator.errors();
			generator.next(); // start the generator
			generator.return(undefined); // terminate early

			const result = validator.submit({ id: 'r3', data: { 'unique-string': 'gamma' } });
			expect(result.success).to.be.true;
		});

		it('multiple error reports must all complete before submit() will become unlocked', () => {
			const validator = new CrossRecordValidator(schemaUniqueString);
			validator.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });
			validator.submit({ id: 'r2', data: { 'unique-string': 'alpha' } });

			const generator1 = validator.errors();
			generator1.next();
			const generator2 = validator.errors();
			generator2.next();

			const result = validator.submit({ id: 'r3', data: { 'unique-string': 'gamma' } });
			assertFailure(result);

			[...generator1];

			const result2 = validator.submit({ id: 'r3', data: { 'unique-string': 'gamma' } });
			assertFailure(result2);

			[...generator2];

			const result3 = validator.submit({ id: 'r3', data: { 'unique-string': 'gamma' } });
			assertSuccess(result3);
		});
	});
});
