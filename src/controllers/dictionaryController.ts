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

import { Request, Response } from 'express';
import * as dictionaryService from '../services/dictionaryService';
import { BadRequestError } from '../utils/errors';
import { replaceReferences } from '../utils/references';

import { Dictionary, Schema } from '../types/dictionaryTypes';

export const listDictionaries = async (
	req: Request<{}, {}, {}, { name: string; version: string; references: boolean }>,
	res: Response,
) => {
	const name = req.query.name;
	const version = req.query.version;
	const showReferences = req.query.references || false;

	if (name && version) {
		const dict = await dictionaryService.findOne(name, version);
		const response = showReferences ? dict : replaceReferences(dict);
		res.status(200).send([response]);
	} else {
		const dicts = await dictionaryService.listAll();
		const response = name !== undefined ? dicts.filter((dict) => dict.name === name) : dicts;
		res.status(200).send(response);
	}
};

export const getDictionary = async (req: Request, res: Response) => {
	const showReferences = req.query.references || false;

	const dictId = req.params.dictId;
	if (!dictId) {
		throw new BadRequestError('Request is missing `dictId` parameter.');
	}

	const dict = await dictionaryService.getOne(dictId);
	const response = showReferences ? dict : replaceReferences(dict);
	res.status(200).send(response);
};

export const createDictionary = async (req: Request, res: Response) => {
	const requestDict = Dictionary.parse(req.body);
	const dict = await dictionaryService.create(requestDict);
	res.status(200).send(dict);
};

export const addSchema = async (req: Request, res: Response) => {
	const dictId = req.params.dictId;
	if (!dictId) {
		throw new BadRequestError('Request is missing `dictId` parameter.');
	}

	const requestSchema = Schema.parse(req.body);

	const dict = await dictionaryService.addSchema(dictId, requestSchema);
	res.status(200).send(dict);
};

export const updateSchema = async (req: Request, res: Response) => {
	const dictId = req.params.dictId;
	if (!dictId) {
		throw new BadRequestError('Request is missing `dictId` parameter.');
	}

	const requestSchema = Schema.parse(req.body);

	const major = req.query.major && req.query.major == 'true' ? true : false;
	const dict = await dictionaryService.updateSchema(dictId, requestSchema, major);
	res.status(200).send(dict);
};
