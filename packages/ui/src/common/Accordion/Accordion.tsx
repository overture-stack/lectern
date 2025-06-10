/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState } from 'react';
import AccordionItem, { AccordionData } from './AccordionItem';

type AccordionProps = {
	accordionItems: Array<AccordionData>;
};

const accordionStyle = css`
	list-style: none;
	padding: 0;
	margin: 0;
`;

/**
 * Accordion component to display collapsible items with titles and content.
 * @param {AccordionProps} props - The properties for the Accordion component.
 * @param {Array<AccordionData>} props.accordionItems - An array of accordion items, each containing a title, description and content.
 * @returns {JSX.Element} The rendered Accordion component.
 * @example
 * const accordionItems = [
 *  { title: 'Item 1', description: 'Description 1', content: 'Content for item 1' },
 *  { title: 'Item 2', description: 'Description 2', content: 'Content for item 2' },
 * ];
 * <Accordion accordionItems={accordionItems} />
 * Essentially pass in an an array of objects that are of type AccordionData, and it will render an accordion with those items.
 */

const Accordion = ({ accordionItems }: AccordionProps) => {
	const [currentIdx, setCurrentIdx] = useState(-1);
	const btnOnClick = (idx: number) => {
		setCurrentIdx((currentValue) => (currentValue !== idx ? idx : -1));
	};

	return (
		<ul css={accordionStyle}>
			{accordionItems.map((item, idx) => (
				<AccordionItem key={idx} data={item} isOpen={idx === currentIdx} onClick={() => btnOnClick(idx)} />
			))}
		</ul>
	);
};
export default Accordion;
