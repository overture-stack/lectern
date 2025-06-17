import { Schema } from '@overture-stack/lectern-dictionary';
import Accordion from '../../common/Accordion/Accordion';
import { AccordionData } from '../../common/Accordion/AccordionItem';
import SchemaTable from './SchemaTable';
type props = {
	schema: Schema;
};
const SchemaTableWithAccordion = ({ schema }: props) => {
	const accordionItems: Array<AccordionData> = [
		{
			title: schema.name,
			description: schema.description ?? '',
			openOnInit: false,
			content: <SchemaTable schema={schema} />,
		},
	];
	return <Accordion accordionItems={accordionItems}></Accordion>;
};

export default SchemaTableWithAccordion;
