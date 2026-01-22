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
import { ColumnDef, getCoreRowModel, HeaderGroup, useReactTable } from '@tanstack/react-table';
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

import { type Theme, useThemeContext } from '../../theme/index';
import TableHeader from './TableHeader';
import TableRow from './TableRow';

export type GenericTableProps<R> = {
	data: R[];
	columns: ColumnDef<R, any>[];
	columnWidths?: string[];
};

type ScrollShadowsResult = {
	scrollRef: RefObject<HTMLDivElement | null>;
	showLeftShadow: boolean;
	showRightShadow: boolean;
	firstColumnWidth: number;
};

const scrollWrapperStyle = css`
	position: relative;
	overflow: hidden;
	border-radius: 4px;
	margin-bottom: 48px;
`;

const shadowStyle = css`
	position: absolute;
	top: 2%;
	width: 20px;
	height: 100%;
	pointer-events: none;
	transition: opacity 0.3s ease;
`;

const leftShadowStyle = (width: number, opacity: number, theme: Theme) => css`
	${shadowStyle}
	left: ${width}px;
	background: linear-gradient(90deg, ${theme.shadow.subtle}, transparent);
	opacity: ${opacity};
	z-index: 1;
`;

const rightShadowStyle = (opacity: number, theme: Theme) => css`
	${shadowStyle}
	right: 0;
	background: linear-gradient(270deg, ${theme.shadow.subtle}, transparent);
	opacity: ${opacity};
	z-index: 1;
`;

const tableContainerStyle = css`
	overflow-x: auto;
	max-width: 100%;
`;

const tableStyle = (theme: Theme) => css`
	min-width: 1200px;
	border-collapse: collapse;
	border: 1px solid ${theme.colors.grey_3};
	margin-top: 8px;
	position: relative;
	width: 100%;
`;
const tableBorderStyle = (theme: Theme) => css`
	border: 1px solid ${theme.colors.border_light};
`;

/**
 * Hook for managing scroll shadows on horizontally scrollable tables.
 * @returns {ScrollShadowsResult} Scroll shadow state and refs
 */
export const useScrollShadows = (): ScrollShadowsResult => {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [showLeftShadow, setShowLeftShadow] = useState(false);
	const [showRightShadow, setShowRightShadow] = useState(false);
	const [firstColumnWidth, setFirstColumnWidth] = useState(0);

	const updateFirstColumnWidth = useCallback(() => {
		if (!scrollRef.current) {
			return;
		}
		const firstTh = scrollRef.current.querySelector('th:first-child');
		if (firstTh instanceof HTMLElement) {
			setFirstColumnWidth(firstTh.getBoundingClientRect().width);
		}
	}, []);

	const handleScroll = useCallback(() => {
		if (!scrollRef.current) {
			return;
		}
		const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
		setShowLeftShadow(scrollLeft > 0);
		setShowRightShadow(scrollWidth - scrollLeft - clientWidth > 0);
	}, []);

	useEffect(() => {
		const scrollElement = scrollRef.current;
		if (!scrollElement) {
			return;
		}
		handleScroll();
		scrollElement.addEventListener('scroll', handleScroll);
		return () => scrollElement.removeEventListener('scroll', handleScroll);
	}, [handleScroll]);

	useEffect(() => {
		updateFirstColumnWidth();
		window.addEventListener('resize', updateFirstColumnWidth);
		return () => window.removeEventListener('resize', updateFirstColumnWidth);
	}, [updateFirstColumnWidth]);

	return {
		scrollRef,
		showLeftShadow,
		showRightShadow,
		firstColumnWidth,
	};
};

/**
 * Generic table component with horizontal scroll and shadow effects.
 * @template R - Row data type (can be any object type)
 * @param {R[]} data - Array of row data
 * @param {ColumnDef<R, any>[]} columns - TanStack table column definitions
 * @param {string[]} columnWidths - Optional array of CSS width values for each column
 * @returns {JSX.Element} Generic Table component
 */
const Table = <R,>({ columns, data, columnWidths }: GenericTableProps<R>) => {
	const theme: Theme = useThemeContext();
	const { scrollRef, showLeftShadow, showRightShadow, firstColumnWidth } = useScrollShadows();

	const table = useReactTable({
		data: data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div css={scrollWrapperStyle}>
			<div css={tableContainerStyle} ref={scrollRef}>
				<div css={leftShadowStyle(firstColumnWidth, showLeftShadow ? 1 : 0, theme)} />
				<div css={rightShadowStyle(showRightShadow ? 1 : 0, theme)} />
				<table css={tableStyle(theme)}>
					<thead css={tableBorderStyle(theme)}>
						{table.getHeaderGroups().map((headerGroup: HeaderGroup<R>) => (
							<TableHeader key={headerGroup.id} headerGroup={headerGroup} columnWidths={columnWidths} />
						))}
					</thead>
					<tbody css={tableBorderStyle(theme)}>
						{table.getRowModel().rows.map((row, i: number) => (
							<TableRow key={row.id} row={row} index={i} columnWidths={columnWidths} />
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default Table;
