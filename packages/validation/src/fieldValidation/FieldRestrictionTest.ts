import type { ArrayDataValue, DataRecordValue, SingleDataValue } from 'dictionary';
import type { TestResult } from '../types';

export type RestrictionTestInvalidArrayItem = {
	position: number;
	value: SingleDataValue;
};

export type RestrictionTestInvalidInfo = {
	message: string;
	invalidItems?: Array<RestrictionTestInvalidArrayItem>;
};

export type FieldRestrictionSingleValueTest<Rule> = (
	rule: Rule,
	value: SingleDataValue,
) => TestResult<RestrictionTestInvalidInfo>;
export type FieldRestrictionArrayTest<Rule> = (
	rule: Rule,
	values: ArrayDataValue,
) => TestResult<RestrictionTestInvalidInfo>;
export type FieldRestrictionTest<Rule> = (rule: Rule, value: DataRecordValue) => TestResult<RestrictionTestInvalidInfo>;
