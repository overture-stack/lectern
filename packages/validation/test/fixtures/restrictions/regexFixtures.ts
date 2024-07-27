import type { RestrictionRegex } from 'dictionary';

export const regexYearMonthDay: RestrictionRegex = '^([12]\\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01]))$'; // Example: "1999-01-31"
export const regexMTGMana: RestrictionRegex =
	'^({((([WUBRG]|([0-9]|[1-9][0-9]*))(/[WUBRG])?)|(X)|([WUBRG](/[WUBRG])?/[P]))})+$';
