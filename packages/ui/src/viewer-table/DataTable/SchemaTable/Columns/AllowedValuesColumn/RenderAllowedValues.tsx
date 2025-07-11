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

import { SchemaField, SchemaRestrictions } from '@overture-stack/lectern-dictionary';
import InlineCode from '../../../../../common/InlineCode';
import { computeAllowedValuesColumn } from './ComputeAllowedValues';

export const renderAllowedValuesColumn = (restrictions: SchemaRestrictions, schemaField: SchemaField) => {
	const restrictionItems = computeAllowedValuesColumn(restrictions, schemaField);

	if (Object.keys(restrictionItems).length === 0) {
		return <strong>None</strong>;
	}

	return (
		<>
			{Object.entries(restrictionItems).map(([k, v]) => {
				const { prefix, content } = v;

				if (prefix.includes('Depends on')) {
					return (
						<>
							<strong>{prefix}</strong>
							<br />
							{content.map((item, i) => (
								<InlineCode key={i}>{item}</InlineCode>
							))}
						</>
					);
				}

				if (prefix.length === content.length) {
					return (
						<>
							{prefix.map((prefix, index) => (
								<span key={index}>
									<strong>{prefix}</strong> {content[index]}{' '}
								</span>
							))}
						</>
					);
				}

				return (
					<span>
						<strong>{prefix}</strong> <br />
						{content.join('\n')}
					</span>
				);
			})}
		</>
	);
};
