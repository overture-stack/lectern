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

import type { Decorator } from '@storybook/react';
import React from 'react';

import type { PartialTheme } from '../src/theme';
import { ThemeProvider } from '../src/theme/ThemeContext';
import recursiveMerge from '../src/utils/recursiveMerge';

const customTheme: PartialTheme = { colors: { accent_dark: 'orange' } };

const testTheme: PartialTheme = {
	colors: {
		black: '#ff69b4',
		accent: '#0d9488',
		accent_light: '#14b8a6',
		accent_dark: '#0f766e',
		accent_1: '#f0fdfa',
	},
};

function getGlobalTheme(globalTheme: string): PartialTheme {
	switch (globalTheme) {
		case 'custom': {
			return customTheme;
		}
		case 'test': {
			return testTheme;
		}
		default: {
			return {};
		}
	}
}

const themeDecorator =
	(customTheme: PartialTheme = {}): Decorator =>
	(Story, { globals: { theme } }) => {
		return (
			<ThemeProvider theme={recursiveMerge(getGlobalTheme(theme), customTheme)}>
				<Story />
			</ThemeProvider>
		);
	};

export default themeDecorator;
