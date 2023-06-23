/*
 * Copyright (c) 2020 The Ontario Institute for Cancer Research. All rights reserved
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

import { MalformedVersionError } from './errors';

export const isValidVersion = (version: string): boolean => {
	return /^[0-9]+\.[0-9]+$/.test(version);
};

export const incrementMinor = (version: string): string => {
	if (!isValidVersion(version)) throw new MalformedVersionError('Version string is malformed: ' + version);
	const parts = version.split('.');
	return parts[0] + '.' + (parseInt(parts[1]) + 1).toString();
};

export const incrementMajor = (version: string): string => {
	if (!isValidVersion(version)) throw new MalformedVersionError('Version string is malformed: ' + version);
	const parts = version.split('.');
	return (parseInt(parts[0]) + 1).toString() + '.' + '0';
};

export const isGreater = (v1: string, v2: string): boolean => {
	if (!isValidVersion(v1) || !isValidVersion(v2)) {
		new MalformedVersionError(`Cannot compare versions: ${v1} , ${v2}`);
	}

	const v1Parts = v1.split('.');
	const v2Parts = v2.split('.');

	if (parseInt(v1Parts[0]) > parseInt(v2Parts[0])) {
		return true;
	} else if (parseInt(v1Parts[0]) < parseInt(v2Parts[0])) {
		return false;
	} else {
		if (parseInt(v1Parts[1]) > parseInt(v2Parts[1])) {
			return true;
		} else {
			return false;
		}
	}
};
