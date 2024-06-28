import type { DataRecordValue } from 'dictionary';
import type { FieldRestrictionRule } from './restrictionRules';
import type { RestrictionTestInvalidArrayItem } from './restrictionTestResult';

export type FieldValidationError = {
	message: string;
	restriction: FieldRestrictionRule;
	invalidItems?: Array<RestrictionTestInvalidArrayItem>;
};

export type FieldValidationResult_RestrictionErrors = {
	fieldName: string;
	value: DataRecordValue;
	result: 'INVALID';
	errors: Array<FieldValidationError>;
};
export type FieldValidationResult_Unrecognized = {
	fieldName: string;
	value: DataRecordValue;
	result: 'UNRECOGNIZED_FIELD';
};

export type FieldValidationResult = FieldValidationResult_RestrictionErrors | FieldValidationResult_Unrecognized;
