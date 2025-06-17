import Accordion from '../../common/Accordion/Accordion';
import { AccordionData } from '../../common/Accordion/AccordionItem';
import biosampleDictionary from '../../../stories/fixtures/minimalBiosampleModel';
const schema = biosampleDictionary.schemas[0];
import SchemaTable from './SchemaTable';
const SchemaTableWithAccordion = () => {
	const accordionItems: Array<AccordionData> = [
		{
			title: 'Hello World',
			description: 'I am drinking coffee',
			openOnInit: false,
			content: <SchemaTable schema={schema} />,
		},
	];
	return <Accordion accordionItems={accordionItems}></Accordion>;
};

export default SchemaTableWithAccordion;
