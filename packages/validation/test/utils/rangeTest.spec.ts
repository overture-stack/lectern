import type { RestrictionRange } from 'dictionary';
import { isWithinRange } from '../../src/utils/isWithinRange';
import { expect } from 'chai';

describe('rangeTest', () => {
	describe('Min only', () => {
		it('Returns true when value greater than min', () => {
			const range: RestrictionRange = { min: 0 };
			const result = isWithinRange(range, 10);
			expect(result).to.be.true;
		});
		it('Returns false when value lesser than min', () => {
			const range: RestrictionRange = { min: 0 };
			const result = isWithinRange(range, -10);
			expect(result).to.be.false;
		});
	});
	describe('Max only', () => {
		it('Returns true when value lesser than max', () => {
			const range: RestrictionRange = { max: 100 };
			const result = isWithinRange(range, 10);
			expect(result).to.be.true;
		});
		it('Returns false when value greater than max', () => {
			const range: RestrictionRange = { max: 100 };
			const result = isWithinRange(range, 110);
			expect(result).to.be.false;
		});
		it('Returns false when value equals max', () => {
			const max = 100;
			const range: RestrictionRange = { max };
			const result = isWithinRange(range, max);
			expect(result).to.be.false;
		});
	});
	describe('Exclusive max', () => {
		it('Returns true when value lesser than exclusiveMax', () => {
			const range: RestrictionRange = { exclusiveMax: 100 };
			const result = isWithinRange(range, 10);
			expect(result).to.be.true;
		});
		it('Returns true when value equals exclusiveMax', () => {
			const exclusiveMax = 100;
			const range: RestrictionRange = { exclusiveMax };
			const result = isWithinRange(range, exclusiveMax);
			expect(result).to.be.true;
		});
		it('Returns false when value greater than exclusiveMax', () => {
			const range: RestrictionRange = { exclusiveMax: 100 };
			const result = isWithinRange(range, 110);
			expect(result).to.be.false;
		});
	});
	describe('Exclusive min', () => {
		it('Returns true when value greater than exclusiveMin', () => {
			const range: RestrictionRange = { exclusiveMin: 10 };
			const result = isWithinRange(range, 20);
			expect(result).to.be.true;
		});
		it('Returns true when value equals exclusiveMin', () => {
			const exclusiveMin = 100;
			const range: RestrictionRange = { exclusiveMin };
			const result = isWithinRange(range, exclusiveMin);
			expect(result).to.be.true;
		});
		it('Returns false when value lesser than exclusiveMin', () => {
			const range: RestrictionRange = { exclusiveMin: 10 };
			const result = isWithinRange(range, 0);
			expect(result).to.be.false;
		});
	});
	it('Returns true when value is within range', () => {
		expect(isWithinRange({ min: 0, max: 10 }, 5)).to.be.true;
		expect(isWithinRange({ min: 0, exclusiveMax: 10 }, 5)).to.be.true;
		expect(isWithinRange({ min: 0, exclusiveMax: 10 }, 10)).to.be.true;
		expect(isWithinRange({ exclusiveMin: 0, max: 10 }, 5)).to.be.true;
		expect(isWithinRange({ exclusiveMin: 0, max: 10 }, 0)).to.be.true;
		expect(isWithinRange({ exclusiveMin: 0, exclusiveMax: 10 }, 5)).to.be.true;
		expect(isWithinRange({ exclusiveMin: 0, exclusiveMax: 10 }, 0)).to.be.true;
		expect(isWithinRange({ exclusiveMin: 0, exclusiveMax: 10 }, 10)).to.be.true;
	});
	it('Returns false when value is outside range', () => {
		expect(isWithinRange({ min: 0, max: 10 }, -5)).to.be.false;
		expect(isWithinRange({ min: 0, max: 10 }, 15)).to.be.false;
		expect(isWithinRange({ min: 0, max: 10 }, 0)).to.be.false;
		expect(isWithinRange({ min: 0, max: 10 }, 10)).to.be.false;
		expect(isWithinRange({ min: 0, exclusiveMax: 10 }, -1)).to.be.false;
		expect(isWithinRange({ min: 0, exclusiveMax: 10 }, 11)).to.be.false;
		expect(isWithinRange({ exclusiveMin: 0, exclusiveMax: 10 }, -1)).to.be.false;
		expect(isWithinRange({ exclusiveMin: 0, exclusiveMax: 10 }, 11)).to.be.false;
	});
});
