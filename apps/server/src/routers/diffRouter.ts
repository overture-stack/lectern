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
import { BadRequestError, DictionaryDiffArray, DiffUtils, replaceReferences } from '@overture-stack/lectern-dictionary';
import { Router } from 'express';
import * as dictionaryService from '../services/dictionaryService';
import { wrapAsync } from './wrappers';

const router = Router();

/**
 * Get Diff between dictionary versions
 */
type DiffRequestQueryParams = Partial<{ name: string; left: string; right: string; references: boolean }>;
router.get(
	'/',
	wrapAsync<{}, DictionaryDiffArray, {}, DiffRequestQueryParams, {}>(async (req, res) => {
		const showReferences = req.query.references || false;
		const name = req.query.name;
		if (!name) {
			throw new BadRequestError('Request is missing `name` parameter.');
		}
		const leftVersion = req.query.left;
		if (!leftVersion) {
			throw new BadRequestError('Request is missing `leftVersion` parameter.');
		}
		const rightVersion = req.query.right;
		if (!rightVersion) {
			throw new BadRequestError('Request is missing `rightVersion` parameter.');
		}

		// These will throw error if the dictionary is not found, must be handled by router (through express wrapper)
		const dict1Doc = await dictionaryService.getOneByNameAndVersion(name, leftVersion);
		const dict2Doc = await dictionaryService.getOneByNameAndVersion(name, rightVersion);
		const dict1 = showReferences ? dict1Doc : replaceReferences(dict1Doc);
		const dict2 = showReferences ? dict2Doc : replaceReferences(dict2Doc);
		const diff = DiffUtils.getDiff(dict1, dict2);

		res.status(200).send(DiffUtils.diffMapToArray(diff));
	}),
);

export default router;
