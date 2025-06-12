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
	//TODO: Some random buttons that we want to add to the accordion items, we will actually need to figure out some schema filtering logic,
	// and download based on that, but for now we just add a button to each item.
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

	// This state keeps track of the clipboard contents, which can be set by the accordion items.
	// Each individual accordion item can set this state when it's tag has been clicked, however only one item can be set at a time.

	const [clipboardContents, setClipboardContents] = useState<string | null>(null);
	const [isCopying, setIsCopying] = useState(false);
	const [copySuccess, setCopySuccess] = useState(false);

	const handleCopy = (text: string) => {
		if (isCopying) {
			return; // We don't wanna copy if we are already copying
		}
		setIsCopying(true);
		navigator.clipboard
			.writeText(text)
			.then(() => {
				setCopySuccess(true);
				setTimeout(() => {
					setIsCopying(false);
				}, 2000); // Reset copy success after 2 seconds as well as the isCopying state
			})
			.catch((err) => {
				console.error('Failed to copy text: ', err);
				setCopySuccess(false);
				setIsCopying(false);
			});
		if (copySuccess) {
			// Update the clipboard contents
			const currentURL = window.location.href;
			setClipboardContents(currentURL);
		}
		setCopySuccess(false);
	};

	useMemo(() => {
		if (clipboardContents) {
			handleCopy(clipboardContents);
		}
	}, [clipboardContents]);

	// This state keeps track of the currently open accordion item index via a boolean array, since each item can be opened or closed independently.
	const [openStates, setOpenStates] = useState<boolean[]>(
		accordionItemsWithButtons.map((accordionItem) => accordionItem.openOnInit), // Initialize with the openOnInit property of each item
	);
	// This state keeps track of which accordion items are open
	const onClick = (idx: number) => {
		setOpenStates((prev) => prev.map((isOpen, index) => (index === idx ? !isOpen : isOpen)));
	};

	return (
		<ul css={accordionStyle}>
			{accordionItemsWithButtons.map((item, idx) => (
				<AccordionItem
					index={idx}
					key={idx}
					data={item}
					setIsOpen={(index) => onClick(index)}
					isOpen={openStates[idx]}
					onClick={() => onClick(idx)}
					setClipboardContents={setClipboardContents}
				/>
			))}
		</ul>
	);
};
export default Accordion;
