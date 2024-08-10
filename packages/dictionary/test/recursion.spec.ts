import { z as zod } from 'zod';
import { expect } from 'chai';
import { RecursiveData, NumberValue, StringValue } from '../src/zodtest';
describe('Recursion', () => {
	it('Non recursive works', () => {
		const input: RecursiveData<StringValue> = { value: 'asdf' };
		const parsed = RecursiveData(StringValue).parse(input);
		expect(input).deep.equal(parsed);
	});
	it('Single nested works', () => {
		const input: RecursiveData<StringValue> = { nested: { value: 'asdf' } };
		const parsed = RecursiveData(StringValue).parse(input);
		expect(input).deep.equal(parsed);
	});
	it('Double nested works', () => {
		const input: RecursiveData<StringValue> = { nested: { nested: { value: 'asdf' } } };
		const parsed = RecursiveData(StringValue).parse(input);
		expect(input).deep.equal(parsed);
	});
	it('Wrong value type has error nested works', () => {
		const input: RecursiveData<StringValue> = { nested: { nested: { value: 'asdf' } } };
		const parsed = RecursiveData(NumberValue).safeParse(input);
		expect(parsed.success).false;
	});
});
