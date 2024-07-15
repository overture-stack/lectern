/*
 * Copyright (c) 2023 The Ontario Institute for Cancer Research. All rights reserved
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

// Success and Failure types
export type Success<T> = { success: true; data: T };
export type Failure<T = void> = { success: false; message: string; data: T };

/**
 * Represents a response that on success will include data of type T,
 * otherwise a message will be returned in place of the data explaining the failure.
 *
 * Optionally, a data type can be provided for the failure case.
 */
export type Result<TSucceed, TFail = void> = Success<TSucceed> | Failure<TFail>;

/* ******************* *
   Convenience Methods 
 * ******************* */

/**
 * Create a successful response for a Result or Either type, with data of the success type
 * @param {T} data
 * @returns {Success<T>} `{success: true, data}`
 */
export const success = <T>(data: T): Success<T> => ({ success: true, data });

/**
 * Create a response indicating a failure with a message describing the failure.
 * @param {string} message
 * @returns {Failure} `{success: true, message, data: undefined}`
 */
export const failure = (message: string): Failure => ({
	success: false,
	message,
	data: undefined,
});

/**
 * Create a failure response with data. If the Result expects failure data, use this function instead of the default `failure`
 * @param {T} data
 * @returns {Failure<T>} `{success: false, message, data}`
 */
export const failWith = <T>(message: string, data: T): Failure<T> => ({
	success: false,
	message,
	data,
});
