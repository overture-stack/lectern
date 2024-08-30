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

/**
 * Convert any value, including unknown, into a string. Originally created to simplify logging caught errors,
 * this is also useful for converting any object you need to log into a string.
 * Errors will be formatted with `errorToString`. Objects will be stringified. Everthing else will be returned as a string.
 * @param input
 * @returns
 */
export const unknownToString = (input: unknown): string => {
	if (input instanceof Error) {
		return errorToString(input);
	} else if (typeof input === 'object') {
		return JSON.stringify(input);
	} else {
		return `${input}`;
	}
};

/**
 * Format an error into a string like `name: message`
 * @param e
 * @returns
 */
export const errorToString = (e: Error): string => `${e.name}: ${e.message}`;

/**
 * Take any number of arguments, of any type, and make them into a string joined with dashes.
 * This will convert errors to readable strings, and will stringify all objects.
 * @param parts
 * @returns
 */
export const toMessage = (...parts: any[]): string => parts.map(unknownToString).join(' - ');
