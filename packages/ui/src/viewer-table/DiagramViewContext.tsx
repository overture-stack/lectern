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

import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type DiagramViewContextType = {
	isOpen: boolean;
	focusField: { schemaName: string; fieldName: string } | undefined;
	openDiagram: () => void;
	openFocusedDiagram: (field: { schemaName: string; fieldName: string }) => void;
	closeDiagram: () => void;
};

export const DiagramViewContext = createContext<DiagramViewContextType>({
	isOpen: false,
	focusField: undefined,
	openDiagram: () => {},
	openFocusedDiagram: () => {},
	closeDiagram: () => {},
});

export const useDiagramViewContext = () => useContext(DiagramViewContext);

export function DiagramViewProvider({ children }: { children: ReactNode }) {
	const [isOpen, setIsOpen] = useState(false);
	const [focusField, setFocusField] = useState<{ schemaName: string; fieldName: string } | undefined>(undefined);

	const openDiagram = useCallback(() => {
		setFocusField(undefined);
		setIsOpen(true);
	}, []);

	const openFocusedDiagram = useCallback((field: { schemaName: string; fieldName: string }) => {
		setFocusField(field);
		setIsOpen(true);
	}, []);

	const closeDiagram = useCallback(() => {
		setIsOpen(false);
		setFocusField(undefined);
	}, []);

	return (
		<DiagramViewContext.Provider value={{ isOpen, focusField, openDiagram, openFocusedDiagram, closeDiagram }}>
			{children}
		</DiagramViewContext.Provider>
	);
}
