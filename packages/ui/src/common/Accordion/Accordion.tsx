/*
 *
 * Copyright (c) 2025 The Ontario Institute for Cancer Research. All rights reserved
 *
 *  This program and the accompanying materials are made available under the terms of
 *  the GNU Affero General Public License v3.0. You should have received a copy of the
 *  GNU Affero General Public License along with this program.
 *   If not, see <http://www.gnu.org/licenses/>.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 *  SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 *  TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 *  OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 *  IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 *  ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { ReactNode, useEffect, useState } from 'react';

import AccordionItem from './AccordionItem';

export type AccordionData = {
	title: string;
	description?: string;
	content: ReactNode;
	schemaName: string;
};
export type AccordionProps = {
	accordionItems: Array<AccordionData>;
	collapseAll: boolean;
};

export type AccordionOpenState = {
	isOpen: boolean;
	toggle: () => void;
};

const accordionStyle = css`
	list-style: none;
	padding: 0;
	margin: 0;
	display: flex;
	flex-direction: column;
	gap: 24px;
	cursor: pointer;
`;

/**
 * Accordion component for displaying collapsible content sections
 *
 * @param accordionItems - Array of accordion items to render
 * @param collapseAll - Controls initial state and dynamic collapse/expand of all items. true = collapsed, false = expanded
 */
const Accordion = ({ accordionItems, collapseAll }: AccordionProps) => {
	const [openStates, setOpenStates] = useState<boolean[]>(accordionItems.map(() => !collapseAll));

	useEffect(() => {
		setOpenStates(accordionItems.map(() => !collapseAll));
	}, [collapseAll]);

	const handleToggle = (index: number) => {
		setOpenStates((prev) => prev.map((isOpen, i) => (i === index ? !isOpen : isOpen)));
	};
	return (
		<ul css={accordionStyle}>
			{accordionItems.map((item, index) => (
				<AccordionItem
					index={index}
					key={index}
					accordionData={item}
					openState={{
						isOpen: openStates[index],
						toggle: () => handleToggle(index),
					}}
				/>
			))}
		</ul>
	);
};
export default Accordion;
