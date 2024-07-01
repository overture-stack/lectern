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

export type FieldRestrictionSingleValueTestFunction<Rule> = (
	rule: Rule,
	value: SingleDataValue,
) => TestResult<RestrictionTestInvalidInfo>;
export type FieldRestrictionArrayTestFunction<Rule> = (
	rule: Rule,
	values: ArrayDataValue,
) => TestResult<RestrictionTestInvalidInfo>;
export type FieldRestrictionTestFunction<Rule> = (
	rule: Rule,
	value: DataRecordValue,
) => TestResult<RestrictionTestInvalidInfo>;
