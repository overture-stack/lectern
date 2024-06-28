import type {
	FieldRestrictionTypes,
	RestrictionCodeList,
	RestrictionRange,
	RestrictionRegex,
	RestrictionScript,
} from 'dictionary';

export type FieldRestrictionRuleCodeList = {
	type: typeof FieldRestrictionTypes.codeList;
	rule: RestrictionCodeList;
};

export type FieldRestrictionRuleRange = {
	type: typeof FieldRestrictionTypes.range;
	rule: RestrictionRange;
};

export type FieldRestrictionRuleRequired = {
	type: typeof FieldRestrictionTypes.required;
	rule: boolean;
};

export type FieldRestrictionRuleRegex = {
	type: typeof FieldRestrictionTypes.regex;
	rule: RestrictionRegex;
};

export type FieldRestrictionRuleScript = {
	type: typeof FieldRestrictionTypes.script;
	rule: RestrictionScript;
};

export type FieldRestrictionRuleUnique = {
	type: typeof FieldRestrictionTypes.unique;
	rule: boolean;
};

export type FieldRestrictionRule =
	| FieldRestrictionRuleCodeList
	| FieldRestrictionRuleRange
	| FieldRestrictionRuleRequired
	| FieldRestrictionRuleRegex
	| FieldRestrictionRuleScript
	| FieldRestrictionRuleUnique;
