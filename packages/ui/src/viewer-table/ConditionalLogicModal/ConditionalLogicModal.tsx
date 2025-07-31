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
import React from 'react';

import Modal from '../../common/Modal';
import { RecursiveElseThenConditionRender } from './ElseThenConditionRender';
import { Description } from './Description';

const containerStyle = css`
	display: flex;
	flex-direction: column;
	gap: 10px;
`;

export type ConditionalLogicModalProps = {
	setIsOpen: (isOpen: boolean) => void;
	isOpen: boolean;
	restrictions: SchemaFieldRestrictions;
	currentSchemaField: SchemaField;
};

/**
 * Modal component that displays conditional logic restrictions for a schema field
 *
 * @param setIsOpen - Function to control modal open/close state
 * @param isOpen - Current open state of the modal
 * @param restrictions - The field restrictions to display
 * @param currentSchemaField - The schema field being described
 * @returns Modal component with conditional logic visualization
 */
export const ConditionalLogicModal = ({
	setIsOpen,
	isOpen,
	restrictions,
	currentSchemaField,
}: ConditionalLogicModalProps) => {
	const renderResult = RecursiveElseThenConditionRender(restrictions, currentSchemaField, 0);

	return (
		<Modal title="Conditional Logic" setIsOpen={setIsOpen} isOpen={isOpen}>
			<div css={containerStyle}>
				<Description schemaLevelField={currentSchemaField} />
				{renderResult && Array.isArray(renderResult.blocks) && renderResult.blocks.length > 0 ?
					renderResult.blocks
				:	<div>No conditional restrictions found.</div>}
			</div>
		</Modal>
	);
};
