import { z as zod } from 'zod';
import { DictionaryBase } from './dictionaryTypes';

/**
 * A Dictionary stored in the DB is represented as a document and gets an `_id` property
 */
export const DictionaryDocument = DictionaryBase.extend({
	_id: zod.string(),
	createdAt: zod.string(),
	updatedAt: zod.string(),
});
export type DictionaryDocument = zod.infer<typeof DictionaryDocument>;

export const DictionaryDocumentSummary = DictionaryDocument.pick({
	name: true,
	version: true,
	description: true,
	_id: true,
});
export type DictionaryDocumentSummary = zod.infer<typeof DictionaryDocumentSummary>;
