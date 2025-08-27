/*
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
 */

import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import recursiveMerge from '../utils/recursiveMerge';
import { type RecursivePartial } from '../utils/RecursivePartial';

import { defaultTheme, type Theme } from './index';

const ThemeContext = createContext<Theme>(defaultTheme);

export function useThemeContext(customTheme: RecursivePartial<Theme> = {}) {
	const theme = useContext(ThemeContext);

	return useMemo(() => recursiveMerge(theme, customTheme), [theme, customTheme]);
}

export function ThemeProvider(props: PropsWithChildren<{ theme?: RecursivePartial<Theme> }>) {
	const theme = useThemeContext(props.theme);

	return <ThemeContext.Provider value={theme}>{props.children}</ThemeContext.Provider>;
}
