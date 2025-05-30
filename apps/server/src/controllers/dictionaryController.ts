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

import {
	BadRequestError,
	Dictionary,
	NotFoundError,
	Schema,
	replaceReferences,
	createDataFileTemplate,
} from '@overture-stack/lectern-dictionary';
import { Request, Response } from 'express';
import * as dictionaryService from '../services/dictionaryService';
import JSZip from 'jszip';

export const listDictionaries = async (
	req: Request<{}, {}, {}, Partial<{ name: string; version: string; references: string }>>,
	res: Response,
) => {
	const name = req.query.name;
	const version = req.query.version;
	const showReferences: boolean = req.query.references === 'true' || false;

	if (name && version) {
		const dict = await dictionaryService.getOneByNameAndVersion(name, version);
		const response = showReferences ? dict : replaceReferences(dict);
		res.status(200).send([response]);
	} else {
		const dicts = await dictionaryService.listAll();
		const response = name !== undefined ? dicts.filter((dict) => dict.name === name) : dicts;
		res.status(200).send(response);
	}
};

export const getDictionary = async (
	req: Request<{ dictId: string }, {}, {}, Partial<{ references: string }>, {}>,
	res: Response,
) => {
	const showReferences = req.query.references === 'true' || false;

	const dictId = req.params.dictId;
	if (!dictId) {
		throw new BadRequestError('Request is missing `dictId` parameter.');
	}

	const dict = await dictionaryService.getOneById(dictId);
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

export const getSchema = async (req: Request<{ dictId: string; schemaName: string }, {}, {}, {}>, res: Response) => {
	const { dictId, schemaName } = req.params;
	if (!dictId) {
		throw new BadRequestError('Request is missing `dictId` parameter.');
	}
	if (!schemaName) {
		throw new BadRequestError('Request is missing `schemaName` parameter.');
	}

	const dictionary = await dictionaryService.getOneById(dictId);
	const formattedDictionary = replaceReferences(dictionary);

	const schema = formattedDictionary.schemas.find((schema) => schema.name === schemaName);

	if (!schema) {
		throw new NotFoundError(
			`Dictionary '${dictionary.name} ${dictionary.version}' does not have a schema named '${schemaName}'`,
		);
	}
	res.send(schema);
};

export const getSchemaField = async (
	req: Request<{ dictId: string; schemaName: string; fieldName: string }, {}, {}, {}>,
	res: Response,
) => {
	const { dictId, schemaName, fieldName } = req.params;
	if (!dictId) {
		throw new BadRequestError('Request is missing `dictId` parameter.');
	}
	if (!schemaName) {
		throw new BadRequestError('Request is missing `schemaName` parameter.');
	}
	if (!fieldName) {
		throw new BadRequestError('Request is missing `fieldName` parameter.');
	}

	const dictionary = await dictionaryService.getOneById(dictId);
	const formattedDictionary = replaceReferences(dictionary);

	const schema = formattedDictionary.schemas.find((schema: { name: string }) => schema.name === schemaName);

	if (!schema) {
		throw new NotFoundError(
			`Dictionary '${dictionary.name} ${dictionary.version}' does not have a schema named '${schemaName}'`,
		);
	}

	const field = schema.fields.find((field: { name: string }) => field.name === fieldName);
	if (!field) {
		throw new NotFoundError(
			`Schema '${schemaName}' from Dictionary '${dictionary.name} ${dictionary.version}' does not have a field named '${fieldName}'`,
		);
	}
	res.send(field);
};

export const downloadTemplates = async (req: Request<{}, {}, {}, { name: string; version: string }>, res: Response) => {
	const { name, version } = req.query;

	if (!name || !version) {
		throw new BadRequestError('Missing dictionary name or version in query.');
	}

	try {
		const dictionary = replaceReferences(await dictionaryService.getOneByNameAndVersion(name, version));

		if (!dictionary) {
			throw new NotFoundError(`Dictionary with name "${name}" and version "${version}" not found.`);
		}

		const zip = new JSZip();

		for (const schema of dictionary.schemas || []) {
			const template = createDataFileTemplate(schema);
			zip.file(template.fileName, template.content);
		}

		const zipContent = await zip.generateAsync({ type: 'nodebuffer' });

		res.set({
			'Content-Disposition': `attachment; filename=${name}_${version}_templates.zip`,
			'Content-Type': 'application/zip',
		});

		res.status(200).send(zipContent);
	} catch (error: any) {
		console.error('Error generating dictionary templates:', error);

		if (error instanceof NotFoundError || error instanceof BadRequestError) {
			res.status(500).json({ message: error.message });
		} else {
			res.status(500).json({ message: 'Failed to generate template zip.' });
		}
	}
};
