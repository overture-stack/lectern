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

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { traceChain, type RelationshipMap } from './diagramUtils';

type ActiveRelationshipState = {
	edgeIds: Set<string>;
	fieldKeys: Set<string>;
	schemaChain: string[];
};

type ActiveRelationshipContextValue = {
	activeEdgeIds?: Set<string>;
	activeFieldKeys?: Set<string>;
	activeSchemaNames?: Set<string>;
	activeSchemaChain?: string[];
	activateRelationship: (chainStartingIndex: number) => void;
	deactivateRelationship: () => void;
	relationshipMap: RelationshipMap;
	isFieldInActiveRelationship: (schemaName: string, fieldName: string) => boolean;
};

const ActiveRelationshipContext = createContext<ActiveRelationshipContextValue | null>(null);

type ActiveRelationshipProviderProps = {
	relationshipMap: RelationshipMap;
	children: ReactNode;
};

/**
 * Provides active relationship state and actions to the ERD component tree.
 * Wraps children with context that tracks which FK chain is currently highlighted,
 * and exposes methods to activate/deactivate highlighting via traceChain.
 *
 * @param {RelationshipMap} relationshipMap — The FK adjacency graph used for chain tracing
 * @param {ReactNode} children — Child components that can consume the active relationship context
 */
export function ActiveRelationshipProvider({ relationshipMap, children }: ActiveRelationshipProviderProps) {
	const [activeState, setActiveState] = useState<ActiveRelationshipState | null>(null);

	const activateRelationship = useCallback(
		(fkIndex: number) => {
			const result = traceChain(fkIndex, relationshipMap);
			setActiveState(result);
		},
		[relationshipMap],
	);

	const deactivateRelationship = useCallback(() => {
		setActiveState(null);
	}, []);

	const isFieldInActiveRelationship = useCallback(
		(schemaName: string, fieldName: string): boolean => {
			if (!activeState) {
				return false;
			}
			return activeState.fieldKeys.has(`${schemaName}::${fieldName}`);
		},
		[activeState],
	);

	const activeSchemaNames = useMemo(() => {
		if (!activeState) {
			return undefined;
		}
		const names = new Set<string>();
		for (const key of activeState.fieldKeys) {
			const schemaName = key.split('::')[0];
			if (schemaName) {
				names.add(schemaName);
			}
		}
		return names;
	}, [activeState]);

	return (
		<ActiveRelationshipContext.Provider
			value={{
				activeEdgeIds: activeState?.edgeIds,
				activeFieldKeys: activeState?.fieldKeys,
				activeSchemaNames,
				activeSchemaChain: activeState?.schemaChain,
				activateRelationship,
				deactivateRelationship,
				relationshipMap,
				isFieldInActiveRelationship,
			}}
		>
			{children}
		</ActiveRelationshipContext.Provider>
	);
}

/**
 * Consumes the active relationship context. Must be called from a component
 * that is a descendant of ActiveRelationshipProvider.
 *
 * @returns {ActiveRelationshipContextValue} The current active relationship state and actions
 */
export function useActiveRelationship(): ActiveRelationshipContextValue {
	const context = useContext(ActiveRelationshipContext);
	if (!context) {
		throw new Error('useActiveRelationship must be used within an ActiveRelationshipProvider');
	}
	return context;
}
