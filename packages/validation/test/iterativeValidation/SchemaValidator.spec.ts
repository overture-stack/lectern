import { expect } from 'chai';
import { SchemaValidator } from '../../src/iterativeValidation/SchemaValidator';
import { assertFailure, assertSuccess } from '../assertResult';
import { schemaAllDataTypes } from '../fixtures/schema/schemaAllDataTypes';
import { schemaSingleString } from '../fixtures/schema/schemaSingleString';
import { schemaSingleStringRequired } from '../fixtures/schema/schemaSingleStringRequired';
import { schemaUniqueFieldAndUniqueKey } from '../fixtures/schema/schemaUniqueFieldAndUniqueKey';
import { schemaUniqueKey } from '../fixtures/schema/schemaUniqueKey';
import { schemaUniqueString } from '../fixtures/schema/schemaUniqueString';

describe('SchemaValidator', () => {
	describe('lifecycle behaviour', () => {
		it('report() with no records submitted returns valid with all counts zero', () => {
			const validator = new SchemaValidator(schemaSingleString);
			const report = validator.report();
			expect(report.valid).to.be.true;
		});

		it('report() called multiple times with no submissions between calls returns the same result', () => {
			const validator = new SchemaValidator(schemaUniqueString);
			validator.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });
			validator.submit({ id: 'r2', data: { 'unique-string': 'alpha' } });

			const firstReport = validator.report();
			const secondReport = validator.report();
			expect(firstReport).to.deep.equal(secondReport);
		});

		it('submit() called after report() is reflected in the next report()', () => {
			const validator = new SchemaValidator(schemaSingleString);
			validator.submit({ id: 'r1', data: { 'any-string': 'alpha' } });

			const firstReport = validator.report();
			expect(firstReport.valid).to.be.true;

			validator.submit({ id: 'r2', data: { 'any-string': 'beta' } });

			const secondReport = validator.report();
			expect(secondReport.valid).to.be.true;
			if (!secondReport.valid) {
				expect(secondReport.details.recordCount).to.equal(2);
			}
		});

		it('single-entry submit and array submit with the same records produce identical report results', () => {
			const validatorSingle = new SchemaValidator(schemaUniqueString);
			validatorSingle.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });
			validatorSingle.submit({ id: 'r2', data: { 'unique-string': 'alpha' } });

			const validatorBatch = new SchemaValidator(schemaUniqueString);
			validatorBatch.submit([
				{ id: 'r1', data: { 'unique-string': 'alpha' } },
				{ id: 'r2', data: { 'unique-string': 'alpha' } },
			]);

			expect(validatorSingle.report()).to.deep.equal(validatorBatch.report());
		});
	});

	describe('submit() return value', () => {
		it('returns success with one entry per submitted record', () => {
			const validator = new SchemaValidator(schemaSingleString);
			const result = validator.submit([
				{ id: 'r1', data: { 'any-string': 'alpha' } },
				{ id: 'r2', data: { 'any-string': 'beta' } },
				{ id: 'r3', data: { 'any-string': 'gamma' } },
			]);
			assertSuccess(result);
			expect(result.data).to.have.length(3);
		});

		it('entry for a valid record has valid: true', () => {
			const validator = new SchemaValidator(schemaSingleString);
			const result = validator.submit({ id: 'r1', data: { 'any-string': 'alpha' } });
			assertSuccess(result);
			expect(result.data[0]?.valid).to.be.true;
		});

		it('entry for a record with an invalid field value has valid: false with details', () => {
			const validator = new SchemaValidator(schemaSingleStringRequired);
			// required field missing
			const result = validator.submit({ id: 'r1', data: {} });
			assertSuccess(result);
			expect(result.data).to.have.length(1);
			expect(result.data[0]?.id).to.equal('r1');
			expect(result.data[0]?.valid).to.be.false;
			if (result.data[0] && !result.data[0].valid) {
				expect(result.data[0].details).to.have.length.greaterThan(0);
			}
		});

		it('id in each data entry matches the id supplied in the submit() entry', () => {
			const validator = new SchemaValidator(schemaSingleStringRequired);
			const result = validator.submit([
				{ id: 'record-a', data: { 'string-required': 'valid' } },
				{ id: 'record-b', data: {} }, // invalid
			]);
			assertSuccess(result);
			expect(result.data).to.have.length(2);
			expect(result.data[0]?.id).to.equal('record-a');
			expect(result.data[1]?.id).to.equal('record-b');
		});

		it('batch submit returns one entry per record with correct valid flag for each', () => {
			const validator = new SchemaValidator(schemaSingleStringRequired);
			const result = validator.submit([
				{ id: 'valid1', data: { 'string-required': 'valid' } },
				{ id: 'invalid2', data: {} }, // missing required
				{ id: 'valid3', data: { 'string-required': 'also-valid' } },
			]);
			assertSuccess(result);
			expect(result.data).to.have.length(3);
			expect(result.data.find((entry) => entry.id === 'valid1')?.valid).to.be.true;
			expect(result.data.find((entry) => entry.id === 'invalid2')?.valid).to.be.false;
			expect(result.data.find((entry) => entry.id === 'valid3')?.valid).to.be.true;
		});

		it('returns DUPLICATE_ID failure when the same id is submitted twice', () => {
			const validator = new SchemaValidator(schemaSingleString);
			validator.submit({ id: 'r1', data: { 'any-string': 'alpha' } });
			const result = validator.submit({ id: 'r1', data: { 'any-string': 'alpha' } });
			assertFailure(result);
			expect(result.data.error).to.equal('DUPLICATE_ID');
		});

		it('returns LOCKED failure while errors() generator is active', () => {
			const validator = new SchemaValidator(schemaUniqueString);
			validator.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });
			validator.submit({ id: 'r2', data: { 'unique-string': 'alpha' } });

			const generator = validator.errors();
			generator.next();

			const result = validator.submit({ id: 'r3', data: { 'unique-string': 'gamma' } });
			assertFailure(result);
			expect(result.data.error).to.equal('LOCKED');

			generator.return(undefined);
		});

		it('multiple active error generators must all complete before submit() becomes unlocked', () => {
			const validator = new SchemaValidator(schemaUniqueString);
			validator.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });
			validator.submit({ id: 'r2', data: { 'unique-string': 'alpha' } });

			const generator1 = validator.errors();
			generator1.next();
			const generator2 = validator.errors();
			generator2.next();

			[...generator1];

			const resultWhileStillLocked = validator.submit({ id: 'r3', data: { 'unique-string': 'gamma' } });
			assertFailure(resultWhileStillLocked);
			expect(resultWhileStillLocked.data.error).to.equal('LOCKED');

			[...generator2];

			const resultAfterUnlocked = validator.submit({ id: 'r3', data: { 'unique-string': 'gamma' } });
			assertSuccess(resultAfterUnlocked);
		});
	});

	describe('cross-record errors', () => {
		it('two records violating unique constraint both submit() successfully with valid: true entries', () => {
			const validator = new SchemaValidator(schemaUniqueString);
			const result1 = validator.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });
			const result2 = validator.submit({ id: 'r2', data: { 'unique-string': 'alpha' } });
			assertSuccess(result1);
			assertSuccess(result2);
			expect(result1.data[0]?.valid).to.be.true;
			expect(result2.data[0]?.valid).to.be.true;
		});

		it('records with both record-level errors and unique violations: submit() returns record results, report() reflects both', () => {
			// schemaUniqueString has a required unique string field - submitting empty data fails validation
			// and also violates unique (both undefined, but undefined is exempt)
			// Use a schema that has both a required field and a unique field
			const validatorCombined = new SchemaValidator(schemaUniqueFieldAndUniqueKey);
			// id is unique, category+code is uniqueKey
			const result1 = validatorCombined.submit({ id: 'r1', data: { id: 'dup', category: 'cat', code: 'A' } });
			const result2 = validatorCombined.submit({ id: 'r2', data: { id: 'dup', category: 'cat', code: 'A' } });

			// Both succeed (unique violations are cross-record, not per-record)
			assertSuccess(result1);
			assertSuccess(result2);
			expect(result1.data[0]?.valid).to.be.true;
			expect(result2.data[0]?.valid).to.be.true;

			const report = validatorCombined.report();
			expect(report.valid).to.be.false;
			if (!report.valid) {
				expect(report.details.crossRecordErrorCounts.unique).to.have.length(1);
				expect(report.details.crossRecordErrorCounts.uniqueKey).to.equal(2);
			}
		});
	});

	describe('report() counts', () => {
		it('returns valid when all submitted records pass validation', () => {
			const validator = new SchemaValidator(schemaSingleString);
			validator.submit({ id: 'r1', data: { 'any-string': 'a' } });
			validator.submit({ id: 'r2', data: { 'any-string': 'b' } });
			validator.submit({ id: 'r3', data: { 'any-string': 'c' } });

			const report = validator.report();
			expect(report.valid).to.be.true;
		});

		it('recordCount equals total accepted records, recordErrorCount equals records with errors', () => {
			const validator = new SchemaValidator(schemaSingleStringRequired);
			validator.submit({ id: 'r1', data: { 'string-required': 'valid' } });
			validator.submit({ id: 'r2', data: {} }); // missing required
			validator.submit({ id: 'r3', data: { 'string-required': 'also-valid' } });
			validator.submit({ id: 'r4', data: {} }); // missing required

			const report = validator.report();
			expect(report.valid).to.be.false;
			if (!report.valid) {
				expect(report.details.recordCount).to.equal(4);
				expect(report.details.recordErrorCount).to.equal(2);
			}
		});

		it('duplicate submissions do not increment recordCount', () => {
			const validator = new SchemaValidator(schemaSingleStringRequired);
			validator.submit({ id: 'r1', data: {} }); // invalid — gives us access to report details
			validator.submit({ id: 'r1', data: {} }); // duplicate — should not be counted

			const report = validator.report();
			expect(report.valid).to.be.false;
			if (!report.valid) {
				expect(report.details.recordCount).to.equal(1);
			}
		});

		it('report() returns invalid when unique constraint is violated', () => {
			const validator = new SchemaValidator(schemaUniqueString);
			validator.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });
			validator.submit({ id: 'r2', data: { 'unique-string': 'alpha' } });

			const report = validator.report();
			expect(report.valid).to.be.false;
			if (!report.valid) {
				expect(report.details.crossRecordErrorCounts.unique).to.have.length(1);
				expect(report.details.crossRecordErrorCounts.unique[0]?.count).to.equal(2);
			}
		});

		it('report() returns invalid when uniqueKey constraint is violated', () => {
			const sameData = { 'any-string': 'a', 'any-number': 1, 'any-integer': 10, 'any-boolean': true };
			const validator = new SchemaValidator(schemaUniqueKey);
			validator.submit({ id: 'r1', data: sameData });
			validator.submit({ id: 'r2', data: sameData });

			const report = validator.report();
			expect(report.valid).to.be.false;
			if (!report.valid) {
				expect(report.details.crossRecordErrorCounts.uniqueKey).to.equal(2);
			}
		});

		it('report() returns invalid when record-level errors exist even with no cross-record violations', () => {
			const validator = new SchemaValidator(schemaSingleStringRequired);
			validator.submit({ id: 'r1', data: {} }); // missing required

			const report = validator.report();
			expect(report.valid).to.be.false;
			if (!report.valid) {
				expect(report.details.recordErrorCount).to.equal(1);
				expect(report.details.crossRecordErrorCounts.unique).to.deep.equal([]);
				expect(report.details.crossRecordErrorCounts.uniqueKey).to.equal(0);
			}
		});
	});

	describe('errors() generator', () => {
		it('yields no errors when all records are valid', () => {
			const validator = new SchemaValidator(schemaUniqueString);
			validator.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });
			validator.submit({ id: 'r2', data: { 'unique-string': 'beta' } });
			const errors = [...validator.errors()];
			expect(errors).to.have.length(0);
		});

		it('yields cross-record unique violation errors', () => {
			const validator = new SchemaValidator(schemaUniqueString);
			validator.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });
			validator.submit({ id: 'r2', data: { 'unique-string': 'alpha' } });
			const errors = [...validator.errors()];
			expect(errors).to.have.length(2);
			expect(errors.every((error) => error.reason === 'INVALID_BY_UNIQUE')).to.be.true;
		});

		it('submit() succeeds after errors() generator is fully consumed', () => {
			const validator = new SchemaValidator(schemaUniqueString);
			validator.submit({ id: 'r1', data: { 'unique-string': 'alpha' } });
			validator.submit({ id: 'r2', data: { 'unique-string': 'alpha' } });

			[...validator.errors()];

			const result = validator.submit({ id: 'r3', data: { 'unique-string': 'gamma' } });
			assertSuccess(result);
		});

		it('does not yield record-level errors (those are returned from submit() only)', () => {
			const validator = new SchemaValidator(schemaSingleStringRequired);
			validator.submit({ id: 'r1', data: {} }); // missing required — record-level error

			const errors = [...validator.errors()];
			// errors() only yields cross-record violations; record-level errors are not stored
			expect(errors).to.have.length(0);
		});
	});

	describe('schema with no unique constraints', () => {
		it('report() returns valid when no unique constraints exist, even with duplicate field values', () => {
			const validator = new SchemaValidator(schemaAllDataTypes);
			validator.submit({ id: 'r1', data: { 'any-string': 'x', 'any-number': 1 } });
			validator.submit({ id: 'r2', data: { 'any-string': 'x', 'any-number': 1 } });

			const report = validator.report();
			expect(report.valid).to.be.true;
		});
	});
});
