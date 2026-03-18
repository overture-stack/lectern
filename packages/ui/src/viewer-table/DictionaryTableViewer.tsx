/*
 *
 * Copyright (c) 2026 The Ontario Institute for Cancer Research. All rights reserved
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
import type { Dictionary, Schema, SchemaFieldRestrictions } from '@overture-stack/lectern-dictionary';
import { useCallback, useEffect, useMemo, useState } from 'react';

import Accordion from '../common/Accordion/index';
import Modal from '../common/Modal';
import { ErrorModal } from '../common/Error/ErrorModal';
import { useDictionaryDataContext, useDictionaryStateContext } from '../dictionary-controller/DictionaryDataContext';
import { type Theme, useThemeContext } from '../theme/index';
import { isFieldRequired } from '../utils/isFieldRequired';
import { DiagramViewProvider, useDiagramViewContext } from './DiagramViewContext';
import {
	ActiveRelationshipProvider,
	buildRelationshipMap,
	RelationshipDiagramContent,
	useActiveRelationship,
} from './EntityRelationshipDiagram';

import SchemaTable from './DataTable/SchemaTable/index';
import DictionaryHeader from './DictionaryHeader/DictionaryHeader';
import DictionaryViewerLoadingPage from './DictionaryViewer/DictionaryViewerLoadingPage';
import DiagramSubtitle from './Toolbar/DiagramSubtitle';
import Toolbar from './Toolbar/index';

export type CustomFilterDropdown = {
	label: string;
	filterProperty: string;
};

export type DictionaryTableViewerProps = {
	customFilterDropdowns?: CustomFilterDropdown[];
};

export type ToolbarCustomDropdown = {
	label: string;
	options: string[];
	selectedValue: string | undefined;
	onSelect: (value: string | undefined) => void;
};

const getByDotPath = (obj: unknown, path: string): unknown =>
	path
		.split('.')
		.reduce<unknown>(
			(acc, key) => (acc != null && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined),
			obj,
		);

type ParsedHashTarget = {
	index: number;
	schemaName: string;
	fieldName?: string;
	type: 'field' | 'schema';
};

const parseHash = (hash: string, schemas: Dictionary['schemas'] | undefined): ParsedHashTarget | null => {
	const cleanHash = hash.replace('#', '');
	if (!cleanHash || !schemas) return null;

	if (cleanHash.includes('.')) {
		const [schemaName, fieldName] = cleanHash.split('.');
		const index = schemas.findIndex((s) => s.name === schemaName);
		if (index >= 0) {
			return { index, schemaName, fieldName, type: 'field' };
		}
		return null;
	}

	const indexByName = schemas.findIndex((s) => s.name === cleanHash);
	if (indexByName !== -1) {
		return { index: indexByName, schemaName: cleanHash, type: 'schema' };
	}

	const numericIndex = parseInt(cleanHash, 10);
	if (!isNaN(numericIndex) && numericIndex >= 0 && numericIndex < schemas.length) {
		return { index: numericIndex, schemaName: schemas[numericIndex].name, type: 'schema' };
	}

	return null;
};

const pageContainerStyle = (theme: Theme) => css`
	margin: 0 auto;
	min-height: calc(100vh - ${theme.dimensions.navbar.height}px - ${theme.dimensions.footer.height}px);
	padding: 0 16px 40px;
	display: flex;
	flex-direction: column;
`;

const headerPanelBlockStyle = css`
	display: flex;
	flex-direction: column;
	gap: 0;
`;

const emptyFilterMessageStyle = (theme: Theme) => css`
	${theme.typography.subtitle}
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 48px;
	color: ${theme.colors.black};
`;

const isConditionalRestriction = (schemaFieldRestriction: SchemaFieldRestrictions) => {
	return schemaFieldRestriction && 'if' in schemaFieldRestriction && schemaFieldRestriction.if !== undefined;
};

const getFilteredSchema = (schema: Schema, filters: string[], activeFilters: [string, string][]): Schema | null => {
	// Schema-level: hide entire schema if it doesn't match active custom filters
	if (activeFilters.length > 0) {
		const matches = activeFilters.every(([filterProperty, value]) => {
			const metaValue = getByDotPath(schema, filterProperty);

			if (metaValue == null) {
				return false;
			}

			if (Array.isArray(metaValue)) {
				return metaValue.some((v) => String(v) === value);
			}

			return String(metaValue) === value;
		});

		if (!matches) {
			return null;
		}
	}

	// Field-level: filter fields within the schema
	if (filters.includes('Required')) {
		const filteredFields = schema.fields.filter((field) => {
			return isFieldRequired(field) || isConditionalRestriction(field.restrictions);
		});

		if (filteredFields.length === schema.fields.length) {
			return schema;
		}

		return { ...schema, fields: filteredFields };
	}
	return schema;
};

const ErrorDisplay = ({ errors, onContactClick }: { errors: string[]; onContactClick: () => void }) => {
	const theme = useThemeContext();
	const isErrorModalOpen = errors.length > 0;

	return (
		<div css={pageContainerStyle(theme)}>
			<ErrorModal isOpen={isErrorModalOpen} setIsOpen={() => {}} errors={errors} onContactClick={onContactClick} />
		</div>
	);
};

const DiagramModal = () => {
	const { isOpen, focusField, closeDiagram } = useDiagramViewContext();
	const { selectedDictionary } = useDictionaryStateContext();
	const { deactivateRelationship } = useActiveRelationship();

	// Clear the relationship when the modal is closed
	useEffect(() => {
		if (!isOpen) {
			deactivateRelationship();
		}
	}, [isOpen, deactivateRelationship]);

	return (
		<Modal
			title="Diagram View"
			subtitle={<DiagramSubtitle isFocused={!!focusField} />}
			isOpen={isOpen}
			setIsOpen={(open) => {
				if (!open) closeDiagram();
			}}
		>
			{selectedDictionary && (
				<div style={{ width: '100%', height: '50vh' }}>
					<RelationshipDiagramContent dictionary={selectedDictionary} focusField={focusField} />
				</div>
			)}
		</Modal>
	);
};

// TODO: produce a simplified version that accepts a dictionary and produces this same view,
// so that there's no requirement for a Lectern server, etc. and without a Toolbar, or a simpler one.

const DictionaryTableViewerContent = ({ customFilterDropdowns }: DictionaryTableViewerProps) => {
	const theme = useThemeContext();
	const { loading, errors } = useDictionaryDataContext();
	const { filters, selectedDictionary } = useDictionaryStateContext();

	const [isCollapsed, setIsCollapsed] = useState(false);
	const [selectedSchemaIndex, setSelectedSchemaIndex] = useState<number | undefined>(undefined);
	const [highlightedField, setHighlightedField] = useState<{ schemaName: string; fieldName: string } | null>(null);
	const [customFilterSelections, setCustomFilterSelections] = useState<Record<string, string | undefined>>({});

	const relationshipMap = useMemo(
		() => (selectedDictionary ? buildRelationshipMap(selectedDictionary) : null),
		[selectedDictionary],
	);

	const toolbarCustomDropdowns: ToolbarCustomDropdown[] | undefined = useMemo(() => {
		if (!customFilterDropdowns?.length || !selectedDictionary?.schemas) {
			return undefined;
		}

		const dropdownContexts = customFilterDropdowns.map((dropdown) => ({
			dropdown,
			set: new Set<string>(),
		}));

		for (const schema of selectedDictionary.schemas) {
			for (const context of dropdownContexts) {
				const val = getByDotPath(schema, context.dropdown.filterProperty);

				if (val == null) {
					continue;
				}

				if (Array.isArray(val)) {
					val.forEach((v) => context.set.add(String(v)));
				} else {
					context.set.add(String(val));
				}
			}
		}

		return dropdownContexts.map(({ dropdown, set }) => ({
			label: dropdown.label,
			options: Array.from(set),
			selectedValue: customFilterSelections[dropdown.filterProperty],
			onSelect: (value: string | undefined) =>
				setCustomFilterSelections((prev) => ({ ...prev, [dropdown.filterProperty]: value })),
		}));
	}, [customFilterDropdowns, selectedDictionary?.schemas, customFilterSelections]);

	const handleHash = useCallback(() => {
		const target = parseHash(window.location.hash, selectedDictionary?.schemas);
		if (!target) return;

		setSelectedSchemaIndex(target.index);
		if (target.fieldName) {
			setHighlightedField({ schemaName: target.schemaName, fieldName: target.fieldName });
		} else {
			setHighlightedField(null);
		}

		const currentHash = window.location.hash.replace('#', '');
		const numericIndex = parseInt(currentHash, 10);
		if (!isNaN(numericIndex) && currentHash === numericIndex.toString()) {
			window.history.replaceState(null, '', `#${target.schemaName}`);
		}

		setTimeout(() => {
			const elementId = target.fieldName ? `${target.schemaName}.${target.fieldName}` : target.schemaName;

			const element = document.getElementById(elementId);
			if (element) {
				element.scrollIntoView({
					behavior: 'smooth',
					block: target.fieldName ? 'center' : 'start',
				});
			}
		}, 300);
	}, [selectedDictionary]);

	useEffect(() => {
		handleHash();
		window.addEventListener('hashchange', handleHash);
		return () => window.removeEventListener('hashchange', handleHash);
	}, [handleHash]);

	const activeFilters: [string, string][] = (customFilterDropdowns ?? []).flatMap((dropdown) => {
		const value = customFilterSelections[dropdown.filterProperty];

		if (value === undefined) {
			return [];
		}

		return [[dropdown.filterProperty, value]];
	});

	const accordionItems = useMemo(() => {
		return (selectedDictionary?.schemas ?? []).flatMap((schema: Schema) => {
			const filtered = getFilteredSchema(schema, filters, activeFilters);

			if (!filtered) {
				return [];
			}

			return [
				{
					title: schema.name,
					description: schema.description,
					content: (
						<SchemaTable
							schema={filtered}
							highlightedFieldName={highlightedField?.schemaName === schema.name ? highlightedField.fieldName : null}
						/>
					),
					schemaName: schema.name,
				},
			];
		});
	}, [selectedDictionary?.schemas, filters, activeFilters, highlightedField]);

	const handleAccordionSelect = (accordionIndex: number) => {
		const schemaName = accordionItems[accordionIndex]?.schemaName;
		if (schemaName) {
			const newUrl = `${window.location.pathname}${window.location.search}#${schemaName}`;
			window.history.pushState(null, '', newUrl);
			window.dispatchEvent(new HashChangeEvent('hashchange'));
		}
	};

	// TODO: Provide a function for the errorModal contact click
	if (loading) {
		return <DictionaryViewerLoadingPage />;
	} else if (errors.length > 0) {
		return (
			<ErrorDisplay
				errors={errors}
				onContactClick={() =>
					console.log(
						'TODO: need to implement a function for action needs to be done when error modal contact is clicked',
					)
				}
			/>
		);
	} else if (!selectedDictionary) {
		return (
			<ErrorDisplay
				errors={['No dictionary data provided']}
				onContactClick={() =>
					console.log(
						'TODO: need to implement a function for action needs to be done when error modal contact is clicked',
					)
				}
			/>
		);
	}

	return (
		<>
			<div css={pageContainerStyle(theme)}>
				<div css={headerPanelBlockStyle}>
					<DictionaryHeader />
				</div>
				<Toolbar
					onSelect={handleAccordionSelect}
					setIsCollapsed={setIsCollapsed}
					isCollapsed={isCollapsed}
					customFilterDropdowns={toolbarCustomDropdowns}
				/>
				{accordionItems.length === 0 && activeFilters.length > 0 ?
					<div css={emptyFilterMessageStyle(theme)}>No schemas match the selected filter criteria.</div>
				:	<Accordion accordionItems={accordionItems} collapseAll={isCollapsed} selectedIndex={selectedSchemaIndex} />}
			</div>
			{relationshipMap && !loading && errors.length === 0 && (
				<ActiveRelationshipProvider relationshipMap={relationshipMap}>
					<DiagramModal />
				</ActiveRelationshipProvider>
			)}
		</>
	);
};

export const DictionaryTableViewer = ({ customFilterDropdowns }: DictionaryTableViewerProps) => (
	<DiagramViewProvider>
		<DictionaryTableViewerContent customFilterDropdowns={customFilterDropdowns} />
	</DiagramViewProvider>
);

export default DictionaryTableViewer;
