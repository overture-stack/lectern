/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState, useMemo, useCallback } from 'react';
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
	// This state keeps track of the clipboard contents, which can be set by the accordion items.
	// Each individual accordion item can set this state when it's tag has been clicked, however only one item can be set at a time.

	const [clipboardContents, setClipboardContents] = useState<string | null>(null);
	const [isCopying, setIsCopying] = useState(false);
	const [copySuccess, setCopySuccess] = useState(false);

	const handleCopy = (text: string) => {
		if (isCopying) {
			return; // We don't want to copy if we are already copying
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
	const [openStates, setOpenStates] = useState<boolean[]>(accordionItems.map((item) => item.openOnInit)); // Inits the component with the openOnInit prop

	const handleToggle = (index: number) => {
		setOpenStates((prev) => prev.map((isOpen, i) => (i === index ? !isOpen : isOpen)));
	};

	return (
		<ul css={accordionStyle}>
			{accordionItems.map((item, index) => (
				<AccordionItem
					index={index}
					key={index}
					data={item}
					openState={{
						isOpen: openStates[index],
						toggle: () => handleToggle(index),
					}}
					setClipboardContents={setClipboardContents}
				/>
			))}
		</ul>
	);
};
export default Accordion;
