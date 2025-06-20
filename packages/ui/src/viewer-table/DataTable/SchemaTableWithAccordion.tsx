import React from 'react';
import { Schema, Dictionary } from '@overture-stack/lectern-dictionary';
import Accordion from '../../common/Accordion/Accordion';
import { AccordionData } from '../../common/Accordion/AccordionItem';
import SchemaTable from './SchemaTable';
type props = {
	schema: Schema;
	dictionary: Dictionary;
};
const SchemaTableWithAccordion = ({ schema, dictionary }: props) => {
	const accordionItems: Array<AccordionData> = [
		{
			title: schema.name,
			description: schema.description ?? '',
			openOnInit: true,
			content: <SchemaTable schema={schema} dictionary={dictionary} />,
		},
	];
	return <Accordion accordionItems={accordionItems}></Accordion>;
};

export default SchemaTableWithAccordion;
