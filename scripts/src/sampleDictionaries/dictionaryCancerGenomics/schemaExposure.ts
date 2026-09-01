import { Schema } from '@overture-stack/lectern-dictionary';
import { assertSchema } from '../assertSchema';
import { schemaDonor } from './schemaDonor';

export const schemaExposure = {
	name: 'exposure',
	description: 'Lifestyle and environmental exposure factors for a donor.',
	fields: [
		{
			name: 'program_id',
			valueType: 'string',
			displayName: 'Program ID',
			description: 'Unique identifier of the program this exposure record belongs to.',
			restrictions: { required: true, regex: '#/regex/submitterId' },
		},
		{
			name: 'submitter_donor_id',
			valueType: 'string',
			displayName: 'Submitter Donor ID',
			description: 'Unique identifier for the donor within this program.',
			restrictions: { required: true, regex: '#/regex/submitterId' },
		},
		{
			name: 'tobacco_smoking_status',
			valueType: 'string',
			displayName: 'Tobacco Smoking Status',
			description: "Donor's self-reported tobacco smoking status and history.",
			restrictions: {
				codeList: [
					'Current reformed smoker for <= 15 years',
					'Current reformed smoker for > 15 years',
					'Current reformed smoker, duration not specified',
					'Current smoker',
					'Lifelong non-smoker (<100 cigarettes smoked in lifetime)',
					'Not applicable',
					'Smoking history not documented',
				],
			},
		},
		{
			name: 'tobacco_type',
			valueType: 'string',
			displayName: 'Tobacco Type',
			isArray: true,
			description: 'Type(s) of tobacco used by the donor.',
			restrictions: {
				codeList: [
					'Chewing Tobacco',
					'Cigar',
					'Cigarettes',
					'Electronic cigarettes',
					'Not applicable',
					'Pipe',
					'Roll-ups',
					'Snuff',
					'Unknown',
					'Waterpipe',
				],
			},
		},
		{
			name: 'pack_years_smoked',
			valueType: 'number',
			displayName: 'Pack Years Smoked',
			description: 'Cigarette smoking intensity in pack years (cigarettes per day × years smoked ÷ 20).',
			restrictions: { range: { min: 0 } },
		},
		{
			name: 'alcohol_history',
			valueType: 'string',
			displayName: 'Alcohol History',
			description: 'Whether the donor has consumed at least 12 alcoholic drinks in their lifetime.',
			restrictions: {
				codeList: '#/enum/yesNoNotApplicableUnknown',
			},
		},
		{
			name: 'alcohol_consumption_category',
			valueType: 'string',
			displayName: 'Alcohol Consumption Category',
			description: "Donor's current level of alcohol use.",
			restrictions: {
				codeList: [
					'Daily Drinker',
					'None',
					'Not applicable',
					'Occasional Drinker (< once a month)',
					'Social Drinker (> once a month, < once a week)',
					'Unknown',
					'Weekly Drinker (>=1x a week)',
				],
			},
		},
		{
			name: 'alcohol_type',
			valueType: 'string',
			displayName: 'Alcohol Type',
			isArray: true,
			description: 'Type(s) of alcohol consumed by the donor.',
			restrictions: {
				codeList: ['Beer', 'Liquor', 'Not applicable', 'Other', 'Unknown', 'Wine'],
			},
		},
		{
			name: 'opiate_use',
			valueType: 'string',
			displayName: 'Opiate Use',
			description: 'Whether the donor has regularly used opiates (at least weekly over a 6-month period).',
			restrictions: {
				codeList: '#/enum/exposureUsage',
			},
		},
		{
			name: 'hot_drinks_consumption',
			valueType: 'string',
			displayName: 'Hot Drink Consumption',
			description: 'Whether the donor regularly drinks hot beverages such as tea or coffee.',
			restrictions: {
				codeList: '#/enum/exposureUsage',
			},
		},
		{
			name: 'red_meat_frequency',
			valueType: 'string',
			displayName: 'Red Meat Consumption Frequency',
			description: 'Frequency of red meat consumption (e.g. beef, pork, lamb).',
			restrictions: {
				codeList: '#/enum/exposureFrequency',
			},
		},
		{
			name: 'processed_meat_frequency',
			valueType: 'string',
			displayName: 'Processed Meat Consumption Frequency',
			description: 'Frequency of processed meat consumption (e.g. ham, salami, sausage).',
			restrictions: {
				codeList: '#/enum/exposureFrequency',
			},
		},
		{
			name: 'soft_drinks_frequency',
			valueType: 'string',
			displayName: 'Soft Drink Consumption Frequency',
			description: 'Frequency of soft drink consumption.',
			restrictions: {
				codeList: '#/enum/exposureFrequency',
			},
		},
		{
			name: 'exercise_frequency',
			valueType: 'string',
			displayName: 'Exercise Frequency',
			description: 'How many times per week the donor exercises for at least 30 minutes.',
			restrictions: {
				codeList: '#/enum/exposureFrequency',
			},
		},
		{
			name: 'exercise_intensity',
			valueType: 'string',
			displayName: 'Exercise Intensity',
			description: 'Intensity of exercise sessions.',
			restrictions: {
				codeList: [
					'Low: No increase in the heart beat, and no perspiration',
					'Moderate: Increase in the heart beat slightly with some light perspiration',
					'Not applicable',
					'Vigorous: Increase in the heart beat substantially with heavy perspiration',
					'Unknown',
				],
			},
		},
	],
	restrictions: {
		uniqueKey: ['program_id', 'submitter_donor_id'],
		foreignKey: [
			{
				schema: schemaDonor.name,
				mappings: [
					{ local: 'program_id', foreign: 'program_id' },
					{ local: 'submitter_donor_id', foreign: 'submitter_donor_id' },
				],
			},
		],
	},
} as const satisfies Schema;

assertSchema(schemaExposure, Schema, 'schemaExposure is not a valid Schema');
