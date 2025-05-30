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
import { Router } from 'express';
import * as dictionaryController from '../controllers/dictionaryController';
import { wrapAsync, wrapAsyncAuth } from './wrappers';

const router = Router();

/**
 * List Dictionaries
 */
router.get('', wrapAsync(dictionaryController.listDictionaries));

/**
 * Create Dictionary
 */
router.post('', wrapAsyncAuth(dictionaryController.createDictionary));

/**
 * Get Dictionary by ID
 */
router.get('/:dictId', wrapAsync(dictionaryController.getDictionary));

/**
 * Add Schema to Dictionary
 */
router.post('/:dictId/schemas', wrapAsyncAuth(dictionaryController.addSchema));

/**
 * Update Schema for Dictionary
 */
router.put('/:dictId/schemas', wrapAsyncAuth(dictionaryController.updateSchema));

/**
 * Get Schema from Dictionary
 */
router.get('/:dictId/schemas/:schemaName', wrapAsync(dictionaryController.getSchema));

/**
 * Get Field from Schema from Dictionary
 */
router.get('/:dictId/schemas/:schemaName/fields/:fieldName', wrapAsync(dictionaryController.getSchemaField));

/**
 * Download Dictionary
 */
router.get('/template/download', wrapAsync(dictionaryController.downloadTemplates));

export default router;
