/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState, useMemo } from 'react';
import AccordionItem, { AccordionData } from './AccordionItem';
import DownloadTemplatesButton from '../../viewer-table/InteractionPanel/DownloadTemplatesButton';

type AccordionProps = {
	accordionItems: Array<AccordionData>;
};

const accordionStyle = css`
	list-style: none;
	padding: 0;
	margin: 0;
	display: flex;
	flex-direction: column;
	gap: 24px;
`;

/**
 * Accordion component to display collapsible items with titles and content.
 * @param {AccordionProps} props - The properties for the Accordion component.
 * @param {Array<AccordionData>} props.accordionItems - An array of accordion items, each containing a title, description and content.
 * @returns {JSX.Element} The rendered Accordion component.
 * @example
 * const accordionItems = [
 *  { title: 'Item 1', description: 'Description 1', openOnInit: true, content: 'Content for item 1' },
 *  { title: 'Item 2', description: 'Description 2', openOnInit: false, content: 'Content for item 2' },
 * ];
 * <Accordion accordionItems={accordionItems} />
 * Essentially pass in an an array of objects that are of type AccordionData, and it will render an accordion with those items.
 */

const Accordion = ({ accordionItems }: AccordionProps) => {
	const accordionItemsWithButtons = useMemo(() => {
		return accordionItems.map((item) => ({
			...item,
			downloadButton: (
				<DownloadTemplatesButton
					version={'1.0'}
					name={'example-dictionary'}
					lecternUrl="http://localhost:3031"
					disabled={false}
					iconOnly={true}
				/>
			),
		}));
	}, [accordionItems]);

	// This state keeps track of the currently open accordion item index via a boolean array, since each item can be opened or closed independently.
	const [openStates, setOpenStates] = useState<boolean[]>(
		accordionItemsWithButtons.map((accordionItem) => accordionItem.openOnInit), // Initialize with the openOnInit property of each item
	);
	// This state keeps track of which accordion items have expanded descriptions
	const [descriptionExpandedStates, setDescriptionExpandedStates] = useState<boolean[]>(
		accordionItemsWithButtons.map(() => false),
	);

	const onClick = (idx: number) => {
		setOpenStates((prev) => prev.map((isOpen, index) => (index === idx ? !isOpen : isOpen)));
	};

	const onDescriptionToggle = (idx: number) => {
		setDescriptionExpandedStates((prev) => prev.map((isExpanded, index) => (index === idx ? !isExpanded : isExpanded)));
	};

	return (
		<ul css={accordionStyle}>
			{accordionItemsWithButtons.map((item, idx) => (
				<AccordionItem
					key={idx}
					data={item}
					isOpen={openStates[idx]}
					onClick={() => onClick(idx)}
					isDescriptionExpanded={descriptionExpandedStates[idx]}
					onDescriptionToggle={() => onDescriptionToggle(idx)}
				/>
			))}
		</ul>
	);
};
export default Accordion;
