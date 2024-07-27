import type { RestrictionCodeListInteger, RestrictionCodeListNumber, RestrictionCodeListString } from 'dictionary';

export const codeListString: RestrictionCodeListString = ['Apple  ', '    Banana', '  Carrot ', 'Donut']; // Food, extra whitespace on items in order to test that matching is being trimmed.
export const codeListInteger: RestrictionCodeListInteger = [1, 1, 2, 3, 5, 8, 13, 24]; // Fibonacci
export const codeListNumber: RestrictionCodeListNumber = [1.61803, 2.41421, 3.30278, 4.23607]; // Metallic Ratios
