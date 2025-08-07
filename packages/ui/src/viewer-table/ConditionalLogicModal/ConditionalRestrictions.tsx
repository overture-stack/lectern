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

import { SchemaField, SchemaFieldRestrictions } from '@overture-stack/lectern-dictionary';

import { ReactNode } from 'react';
import { ProcessConditionalRestrictions } from './ProcessConditionalRestrictions';

/**
 * Processes a single restriction through recursive rendering
 *
 * @param restriction - The field restriction to process
 * @param currentSchemaField - The schema field being described
 */
const processRestriction = (
	restriction: SchemaFieldRestrictions,
	currentSchemaField: SchemaField,
): ReactNode[] | undefined => {
	const result = ProcessConditionalRestrictions(restriction, currentSchemaField);
	return result?.blocks;
};

export type ConditionalRestrictionsRendererProps = {
	restrictions: SchemaFieldRestrictions[];
	currentSchemaField: SchemaField;
};

/**
 * Renders conditional field restrictions
 * @param restrictions - The field restrictions to process
 * @param currentSchemaField - The schema field being described
 * @returns The processed conditional restrictions as React nodes or null
 */
export const ConditionalRestrictions = ({
	restrictions,
	currentSchemaField,
}: ConditionalRestrictionsRendererProps): ReactNode[] | null => {
	if (restrictions === undefined) {
		return null;
	}
	const processedRestrictions = restrictions.flatMap(
		(restriction) => processRestriction(restriction, currentSchemaField) || [],
	);

	return processedRestrictions.length > 0 ? processedRestrictions : null;
};
