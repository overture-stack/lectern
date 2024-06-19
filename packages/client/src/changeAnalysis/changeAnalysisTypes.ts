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

import { SchemaField, ValueChangeTypeName } from '@overture-stack/lectern-dictionary';

type ChangeOnlyTypeNames = Exclude<ValueChangeTypeName, 'unchanged'>;

export interface ChangeAnalysis {
	fields: {
		addedFields: AddedFieldChange[];
		renamedFields: string[];
		deletedFields: string[];
	};
	isArrayDesignationChanges: string[];
	restrictionsChanges: RestrictionChanges;
	metaChanges?: MetaChanges;
	valueTypeChanges: string[];
}

export type RestrictionChanges = {
	range: {
		[key in ChangeOnlyTypeNames]: ObjectChange[];
	};
	codeList: {
		[key in ChangeOnlyTypeNames]: ObjectChange[];
	};
	regex: {
		[key in ChangeOnlyTypeNames]: StringAttributeChange[];
	};
	required: {
		[key in ChangeOnlyTypeNames]: BooleanAttributeChange[];
	};
	script: {
		[key in ChangeOnlyTypeNames]: StringAttributeChange[];
	};
};
export interface AddedFieldChange {
	name: string;
	definition: SchemaField;
}

export interface ObjectChange {
	field: string;
	definition: any;
}

export interface CodeListChange {
	field: string;
	definition: any;
}

export interface StringAttributeChange {
	field: string;
	definition: string;
}

export interface BooleanAttributeChange {
	field: string;
	definition: boolean;
}

// TODO: This references a specific project's meta properties that should be removed from the client
export type MetaChanges = {
	core: {
		changedToCore: string[]; // fields that are core now
		changedFromCore: string[]; // fields that are not core now
	};
};
