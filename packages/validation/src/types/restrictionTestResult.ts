import type { SingleDataValue } from 'dictionary';

export type RestrictionTestValid = {
	valid: true;
};
export const valid = (): RestrictionTestValid => ({ valid: true });

export type RestrictionTestInvalidArrayItem = {
	position: number;
	value: SingleDataValue;
};
export type RestrictionTestInvalid = {
	valid: false;
	message: string;
	invalidItems?: RestrictionTestInvalidArrayItem[];
};

export const invalid = (message: string, invalidItems?: RestrictionTestInvalidArrayItem[]): RestrictionTestInvalid => ({
	valid: false,
	message,
	invalidItems,
});

export type RestrictionTestResult = RestrictionTestValid | RestrictionTestInvalid;
