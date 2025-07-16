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

/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { SchemaField, SchemaFieldRestrictions } from '@overture-stack/lectern-dictionary';

import { Row } from '@tanstack/react-table';
import Pill from '../../../../common/Pill';
import OpenModalButton from '../../../OpenModalButton';

export type Attributes = 'Required' | 'Optional' | 'Required When';

const containerStyle = css`
	display: flex;
	align-items: center;
	flex-direction: column;
	justify-content: center;
	gap: 10px;
`;

export const renderAttributesColumn = (schemaFieldRestrictions: SchemaFieldRestrictions, unique) => {
	return (
		<div css={containerStyle}>
			{schemaFieldRestrictions && 'if' in schemaFieldRestrictions ?
				<OpenModalButton onClick={() => alert('Hello World')}>Required When</OpenModalButton>
			:	<Pill>{schemaFieldRestrictions && 'required' in schemaFieldRestrictions ? 'Required' : 'Optional'}</Pill>}
			{unique && <Pill>Unique</Pill>}
		</div>
	);
};
