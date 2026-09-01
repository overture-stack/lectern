import fs from 'fs';
import path from 'path';
import { dictionaryCancerGenomics } from './sampleDictionaries/dictionaryCancerGenomics';
import { dictionaryMultiRelationship } from './sampleDictionaries/dictionaryMultiRelationship';
import { dictionarySimple } from './sampleDictionaries/dictionarySimple';
import { dictionaryWideConditional } from './sampleDictionaries/dictionaryWideConditional';
import { dictionaryWideUniqueKey } from './sampleDictionaries/dictionaryWideUniqueKey';

const OUTPUT_DIR = path.resolve(__dirname, '../../samples/dictionary');

const dictionaries = [
	dictionarySimple,
	dictionaryWideUniqueKey,
	dictionaryWideConditional,
	dictionaryMultiRelationship,
	dictionaryCancerGenomics,
];

console.log(`Writing sample dictionaries to '${OUTPUT_DIR}'...`);
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

for (const dictionary of dictionaries) {
	const outputPath = path.join(OUTPUT_DIR, `${dictionary.name}.json`);
	fs.writeFileSync(outputPath, JSON.stringify(dictionary, null, 2));
	console.log(`  Wrote ${dictionary.name}.json`);
}

console.log('Done.');
