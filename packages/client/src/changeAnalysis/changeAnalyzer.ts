/*
 * Copyright (c) 2024 The Ontario Institute for Cancer Research. All rights reserved
 *
 * This program and the accompanying materials are made available under the terms of
 * the GNU Affero General Public License v3.0. You should have received a copy of the
 * GNU Affero General Public License along with this program.
 *  If not, see <http://www.gnu.org/licenses/>.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 * SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { DictionaryDiff, FieldChanges, SchemaField, ValueChange } from '@overture-stack/lectern-dictionary';
import * as restClient from '../rest';
import { ChangeAnalysis, RestrictionChanges } from './changeAnalysisTypes';

const isValueChange = (input: FieldChanges): input is ValueChange => ValueChange.safeParse(input).success;

type NestedChanges = { [field: string]: FieldChanges };
const isNestedChange = (input: FieldChanges): input is NestedChanges => {
	// Ensure that the inptu is not undefined and that it doesn't match to a ValueChange
	return input !== undefined && !isValueChange(input);
};

// export const fetchDiffAndAnalyze = async (serviceUrl: string, name: string, fromVersion: string, toVersion: string) => {
// 	// const changes = await restClient.fetchDiff(serviceUrl, name, fromVersion, toVersion);
// 	return analyzeChanges(changes);
// };

export const analyzeChanges = (schemasDiff: DictionaryDiff): ChangeAnalysis => {
	const analysis: ChangeAnalysis = {
		fields: {
			addedFields: [],
			renamedFields: [],
			deletedFields: [],
		},
		isArrayDesignationChanges: [],
		restrictionsChanges: {
			codeList: {
				created: [],
				deleted: [],
				updated: [],
			},
			regex: {
				updated: [],
				created: [],
				deleted: [],
			},
			required: {
				updated: [],
				created: [],
				deleted: [],
			},
			script: {
				updated: [],
				created: [],
				deleted: [],
			},
			range: {
				updated: [],
				created: [],
				deleted: [],
			},
		},
		valueTypeChanges: [],
	};

	schemasDiff.forEach((fieldChange, fieldName) => {
		if (fieldChange) {
			const fieldDiff = fieldChange.diff;

			// if we have type at first level then it's a field add/delete
			if (isValueChange(fieldDiff)) {
				categorizeFieldChanges(analysis, fieldName, fieldDiff);
			}

			if (isNestedChange(fieldDiff)) {
				if (fieldDiff.meta) {
					categorizeMetaChanges(analysis, fieldName, fieldDiff.meta);
				}

				if (fieldDiff.restrictions) {
					categorizeRestrictionChanges(analysis, fieldName, fieldDiff.restrictions, fieldChange.right);
				}

				if (fieldDiff.isArray) {
					categorizeFieldArrayDesignationChange(analysis, fieldName, fieldDiff.isArray);
				}

				if (fieldDiff.valueType) {
					categorizerValueTypeChange(analysis, fieldName);
				}
			}
		}
	});

	return analysis;
};

const categorizeFieldArrayDesignationChange = (analysis: ChangeAnalysis, field: string, changes: FieldChanges) => {
	// changing isArray designation is a relevant change for all cases except if it is created and set to false
	if (!(changes?.type === 'created' && changes.data === false)) {
		analysis.isArrayDesignationChanges.push(field);
	}
};

const categorizerValueTypeChange = (analysis: ChangeAnalysis, field: string) => {
	analysis.valueTypeChanges.push(field);
};

const categorizeRestrictionChanges = (
	analysis: ChangeAnalysis,
	field: string,
	restrictionsChange: FieldChanges,
	fieldDefinitionAfter?: SchemaField,
) => {
	const restrictionsToCheck: (keyof RestrictionChanges)[] = ['regex', 'script', 'required', 'codeList', 'range'];

	// additions or deletions of a restriction object as whole (i.e. contains 1 or many restrictions within the 'data')
	if (isValueChange(restrictionsChange) && restrictionsChange.type !== 'unchanged') {
		const createOrAddChange = restrictionsChange;
		const restrictionsData = createOrAddChange.data;

		for (const k of restrictionsToCheck) {
			if (restrictionsData[k]) {
				switch (k) {
					case 'codeList': {
						analysis.restrictionsChanges[k][restrictionsChange.type].push({
							field: field,
							definition: restrictionsData[k],
						});
						break;
					}
					case 'range': {
						analysis.restrictionsChanges[k][restrictionsChange.type].push({
							field: field,
							definition: restrictionsData[k],
						});
						break;
					}
					case 'regex': {
						analysis.restrictionsChanges[k][restrictionsChange.type].push({
							field: field,
							definition: restrictionsData[k],
						});
						break;
					}
					case 'required': {
						analysis.restrictionsChanges[k][restrictionsChange.type].push({
							field: field,
							definition: restrictionsData[k],
						});
						break;
					}
					case 'script': {
						analysis.restrictionsChanges[k][restrictionsChange.type].push({
							field: field,
							definition: restrictionsData[k],
						});
						break;
					}
				}
			}
		}
		return;
	}

	// in case 'restrictions' key was already there but we modified its contents
	for (const k of restrictionsToCheck) {
		if (restrictionsChange && isNestedChange(restrictionsChange) && k in restrictionsChange) {
			const change = restrictionsChange[k];
			if (k === 'range' && change !== undefined && !change.type) {
				// if the change is nested (type is at max level) then the boundries were updated only : ex:
				/*
         change = {
           "max" : {
             type: "updated"
             data: "..."
           },
           "exclusiveMin": {
             type: "deleted"
             data ..
           }
         }
        */
				// TODO: This section breaks from the expected format as defined by the diff types. needs to be evaluated if it is working correctly.
				if (
					Object.keys(change).some((k) => k == 'max' || k == 'min' || k == 'exclusiveMin' || k == 'exclusiveMax') &&
					fieldDefinitionAfter?.restrictions &&
					'range' in fieldDefinitionAfter.restrictions
				) {
					analysis.restrictionsChanges[k]['updated'].push({
						field: field,
						// we push the whole range definition since it doesnt make sense to just
						// push one boundary.
						definition: fieldDefinitionAfter?.restrictions?.range,
					});
				}
				return;
			}
			if (isValueChange(change) && change.type !== 'unchanged') {
				const definition = change.data;
				switch (k) {
					case 'codeList': {
						analysis.restrictionsChanges[k][change.type].push({
							field: field,
							definition,
						});
						break;
					}
					case 'range': {
						analysis.restrictionsChanges[k][change.type].push({
							field: field,
							definition,
						});
						break;
					}
					case 'regex': {
						analysis.restrictionsChanges[k][change.type].push({
							field: field,
							definition,
						});
						break;
					}
					case 'required': {
						analysis.restrictionsChanges[k][change.type].push({
							field: field,
							definition,
						});
						break;
					}
					case 'script': {
						analysis.restrictionsChanges[k][change.type].push({
							field: field,
							definition,
						});
						break;
					}
				}
			}
		}
	}
};

const categorizeFieldChanges = (analysis: ChangeAnalysis, field: string, changes: ValueChange) => {
	const changeType = changes.type;
	if (changeType === 'created') {
		analysis.fields.addedFields.push({
			name: field,
			definition: changes.data,
		});
	} else if (changeType === 'deleted') {
		analysis.fields.deletedFields.push(field);
	}
};

const categorizeMetaChanges = (analysis: ChangeAnalysis, field: string, metaChanges: FieldChanges) => {
	// **** meta changes - core ***
	if (metaChanges?.data?.core === true) {
		const changeType = metaChanges.type;
		if (changeType === 'created' || changeType === 'updated') {
			analysis.metaChanges?.core.changedToCore.push(field);
		} else if (changeType === 'deleted') {
			analysis.metaChanges?.core.changedFromCore.push(field);
		}
	}
};
