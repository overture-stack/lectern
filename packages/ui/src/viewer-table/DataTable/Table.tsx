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
import { useCallback, useEffect, useRef, useState } from 'react';
import TableHeader from './TableHeader';
import TableRow from './TableRow';

export type GenericTableProps<R> = {
	data: R[];
	columns: ColumnDef<R, any>[];
};

const scrollWrapperStyle = css`
	position: relative;
	overflow: hidden;
	border-radius: 4px;
	margin-bottom: 48px;
`;

const shadowStyle = css`
	position: absolute;
	top: 0.7%;
	z-index: 100;
	width: 20px;
	height: 100%;
	pointer-events: none;
	transition: opacity 0.3s ease;
`;

const leftShadowStyle = (width: number, opacity: number) => css`
	${shadowStyle}
	left: ${width + 25}px;
	background: linear-gradient(90deg, rgba(0, 0, 0, 0.035), transparent);
	opacity: ${opacity};
`;

const rightShadowStyle = (opacity: number) => css`
	${shadowStyle}
	right: 0;
	background: linear-gradient(270deg, rgba(0, 0, 0, 0.06), transparent);
	opacity: ${opacity};
`;

const tableContainerStyle = css`
	overflow-x: auto;
	max-width: 100%;
`;

const tableStyle = css`
	min-width: 1200px;
	border-collapse: collapse;
	border: 1px solid lightgray;
	margin-top: 8px;
	position: relative;
`;
const tableBorderStyle = css`
	border: 1px solid #dcdde1;
`;

const Table = <R,>({ columns, data }: GenericTableProps<R>) => {
	const table = useReactTable({
		data: data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});
	/***************************** MESSY SCROLLING BEHAVIOR***********************/
	const scrollRef = useRef<HTMLDivElement>(null);
	const [showLeftShadow, setShowLeftShadow] = useState(false);
	const [showRightShadow, setShowRightShadow] = useState(false);
	const [firstColumnWidth, setFirstColumnWidth] = useState(0);

	// We need to compute the width of the first column in order to make sure that the scrolling occurs after that point
	const updateFirstColumnWidth = useCallback(() => {
		if (!scrollRef.current) {
			return;
		}
		const firstColumnHeader = scrollRef.current.querySelector('th:first-child');
		if (firstColumnHeader) {
			setFirstColumnWidth(parseFloat(window.getComputedStyle(firstColumnHeader).width));
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

	// Handle scroll events
	useEffect(() => {
		const scrollElement = scrollRef.current;
		if (!scrollElement) {
			return;
		}
		handleScroll();
		scrollElement.addEventListener('scroll', handleScroll);
		return () => scrollElement.removeEventListener('scroll', handleScroll);
	}, [handleScroll]);

	// Handle resize events for first column width
	useEffect(() => {
		// Initial width calculation
		updateFirstColumnWidth();

		window.addEventListener('resize', updateFirstColumnWidth);
		return () => window.removeEventListener('resize', updateFirstColumnWidth);
	}, [updateFirstColumnWidth]);
	/***************************** MESSY SCROLLING BEHAVIOR***********************/

	return (
		<div css={scrollWrapperStyle}>
			<div css={tableContainerStyle} ref={scrollRef}>
				<div css={leftShadowStyle(firstColumnWidth, showLeftShadow ? 1 : 0)} />
				<div css={rightShadowStyle(showRightShadow ? 1 : 0)} />
				<table css={tableStyle}>
					<thead css={tableBorderStyle}>
						{table.getHeaderGroups().map((headerGroup: HeaderGroup<R>) => (
							<TableHeader key={headerGroup.id} headerGroup={headerGroup} />
						))}
					</thead>
					<tbody css={tableBorderStyle}>
						{table.getRowModel().rows.map((row, i: number) => (
							<TableRow key={row.id} row={row} index={i} />
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default Table;
