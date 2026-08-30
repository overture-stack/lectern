/*
 * Copyright (c) 2026 The Ontario Institute for Cancer Research. All rights reserved
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

import { isConditionalRestriction, type ConditionalRestriction, type Schema } from '@overture-stack/lectern-dictionary';

/**
 * Maps each field name to the set of field names it references in its conditional restrictions.
 * Fields with no conditional restrictions map to an empty `Set`.
 */
export type FieldDependencyMap = Map<string, Set<string>>;

/**
 * An ordered list of generation tiers. Fields in tier `n` depend only on fields in tiers `0..n-1`.
 * All fields within the same tier have no ordering constraint between them.
 * When a dependency cycle is detected, all fields involved in the cycle are placed in the same tier.
 */
export type FieldGenerationOrder = string[][];

/**
 * Recursively walks a restriction tree and adds all field names referenced in conditional `if`
 * clauses to `accumulator`. Both `then` and `else` branches are traversed regardless of runtime
 * evaluation — this is a static analysis pass.
 */
const collectDependencyFieldNames = <TRestrictions extends object>(
	restriction:
		| TRestrictions
		| ConditionalRestriction<TRestrictions>
		| (TRestrictions | ConditionalRestriction<TRestrictions>)[]
		| undefined,
	accumulator: Set<string>,
): void => {
	if (restriction === undefined) {
		return;
	}

	const entries = Array.isArray(restriction) ? restriction : [restriction];

	for (const entry of entries) {
		if (isConditionalRestriction(entry)) {
			for (const condition of entry.if.conditions) {
				for (const fieldName of condition.fields) {
					accumulator.add(fieldName);
				}
			}
			collectDependencyFieldNames(entry.then, accumulator);
			collectDependencyFieldNames(entry.else, accumulator);
		}
	}
};

/**
 * Builds a static dependency map for all fields in `schema`. Each field maps to the set of other
 * field names it references in conditional restrictions. Self-references and references to fields
 * not defined in the schema are excluded.
 */
export const extractFieldDependencies = (schema: Schema): FieldDependencyMap => {
	const schemaFieldNames = new Set(schema.fields.map((field) => field.name));
	const dependencyMap: FieldDependencyMap = new Map();

	for (const field of schema.fields) {
		const dependencies = new Set<string>();
		collectDependencyFieldNames(field.restrictions, dependencies);
		dependencies.delete(field.name);
		for (const dependency of dependencies) {
			if (!schemaFieldNames.has(dependency)) {
				dependencies.delete(dependency);
			}
		}
		dependencyMap.set(field.name, dependencies);
	}

	return dependencyMap;
};

/**
 * Determines the order in which fields should be generated using Kahn's topological sort algorithm.
 * Returns a list of tiers: fields in tier `n` may only reference fields from earlier tiers.
 * Fields within the same tier have no ordering constraint between them.
 *
 * If a dependency cycle is detected (fields that cannot be resolved due to circular references),
 * all remaining cyclic fields are placed together in a final tier.
 */
export const resolveGenerationOrder = (schema: Schema): FieldGenerationOrder => {
	const dependencyMap = extractFieldDependencies(schema);
	const schemaFieldNames = schema.fields.map((field) => field.name);

	const inDegree = new Map<string, number>();
	const dependents = new Map<string, Set<string>>();

	for (const fieldName of schemaFieldNames) {
		inDegree.set(fieldName, 0);
		dependents.set(fieldName, new Set());
	}

	for (const fieldName of schemaFieldNames) {
		const dependencies = dependencyMap.get(fieldName) ?? new Set();
		for (const dependency of dependencies) {
			inDegree.set(fieldName, (inDegree.get(fieldName) ?? 0) + 1);
			const dependentSet = dependents.get(dependency);
			if (dependentSet !== undefined) {
				dependentSet.add(fieldName);
			}
		}
	}

	const processed = new Set<string>();
	const order: FieldGenerationOrder = [];

	while (processed.size < schemaFieldNames.length) {
		const currentTier = schemaFieldNames.filter(
			(fieldName) => !processed.has(fieldName) && (inDegree.get(fieldName) ?? 0) === 0,
		);

		if (currentTier.length === 0) {
			// Cycle detected — emit all remaining fields as a single tier.
			const remaining = schemaFieldNames.filter((fieldName) => !processed.has(fieldName));
			order.push(remaining);
			break;
		}

		order.push(currentTier);

		for (const fieldName of currentTier) {
			processed.add(fieldName);
			for (const dependent of dependents.get(fieldName) ?? new Set()) {
				inDegree.set(dependent, (inDegree.get(dependent) ?? 0) - 1);
			}
		}
	}

	return order;
};
