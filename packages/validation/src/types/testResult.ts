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

export type TestResultValid = {
	valid: true;
};
export const valid = (): TestResultValid => ({ valid: true });

export type TestResultInvalid<T> = {
	valid: false;
	info: T;
};

/**
 * Convenience method to return an InvalidTest object.
 * @param message
 * @param info
 * @returns
 */
export const invalid = <InvalidInfo>(info: InvalidInfo): TestResultInvalid<InvalidInfo> => ({
	valid: false,
	info,
});

/**
 * A TestResult represents the outcome of a test applied to some data. For example, a test
 * could be checking if a string value can be converted to the dataType of a given field, or it
 * could test if a number value passes all restrictions provided for a field.
 *
 * If a test is valid, no additional data is added to the result. If it is invalid, then the
 * reason (or array of reasons) for why the test failed should be given. To make this type
 * reusable, the specific type of the invalid info is left as a generic.
 *
 * There are convenience methods available to return valid() and invalid(info) objects:
 *
 * @example
 * if(hasFailure) {
 * 	return invalid(reason);
 * }
 * return valid();
 */
export type TestResult<InvalidInfo> = TestResultValid | TestResultInvalid<InvalidInfo>;
