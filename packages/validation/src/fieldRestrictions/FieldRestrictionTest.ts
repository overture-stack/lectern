import type { ArrayDataValue, DataRecordValue, SingleDataValue } from 'dictionary';
import type { RestrictionTestResult } from '../types';

export type FieldRestrictionSingleValueTest<Rule> = (rule: Rule, value: SingleDataValue) => RestrictionTestResult;
export type FieldRestrictionArrayTest<Rule> = (rule: Rule, values: ArrayDataValue) => RestrictionTestResult;
export type FieldRestrictionTest<Rule> = (rule: Rule, value: DataRecordValue) => RestrictionTestResult;
