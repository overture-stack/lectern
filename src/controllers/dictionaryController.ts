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

import { Request, Response } from 'express';
import * as dictionaryService from '../services/dictionaryService';
import { BadRequestError } from '../utils/errors';
import { replaceReferences } from '../utils/references';
import { diff as diffUtil } from '../diff/DictionaryDiff';
import logger from '../config/logger';
import { DictionaryDocument } from '../models/Dictionary';

export const listDictionaries = async (req: Request, res: Response) => {
  const name = req.query.name.toString();
  const version = req.query.version.toString();
  const showReferences = req.query.references || false;

  if (name && version) {
    const dict = await dictionaryService.findOne(name, version);
    if (dict == undefined) {
      logger.info(`Failed to find dictionary ${name} ${version}`);
      res.status(404).send(`Dictionary Not Found: ${name} ${version}`);
      return;
    }
    const response = showReferences ? dict.toObject() : replaceReferences(dict.toObject() as DictionaryDocument);
    res.status(200).send([response]);
  } else {
    const dicts = await dictionaryService.listAll();
    const response = name !== undefined ? dicts.filter(dict => dict.name === name) : dicts;
    res.status(200).send(response);
  }
};

export const getDictionary = async (req: Request, res: Response) => {
  const showReferences = req.query.references || false;
  const id = req.params.dictId;

  const dict = await dictionaryService.getOne(id);
  const response = showReferences ? dict.toObject() : replaceReferences(dict.toObject() as DictionaryDocument);
  res.status(200).send(response);
};

export const createDictionary = async (req: Request, res: Response) => {
  const dict = await dictionaryService.create(req.body);
  res.status(200).send(dict.toObject());
};

export const addSchema = async (req: Request, res: Response) => {
  const dict = await dictionaryService.addSchema(req.params.dictId, req.body);
  res.status(200).send(dict.toObject());
};

export const updateSchema = async (req: Request, res: Response) => {
  const major = req.query.major && req.query.major == 'true' ? true : false;
  if (req.params.dictId === undefined) throw new BadRequestError('Must specify valid dictId');
  const dict = await dictionaryService.updateSchema(req.params.dictId, req.body, major);
  res.status(200).send(dict.toObject());
};

export const diffDictionaries = async (req: Request, res: Response) => {
  const showReferences = req.query.references || false;
  const name = req.query.name.toString();
  const leftVersion = req.query.left.toString()
  const rightVersion = req.query.right.toString();

  if (name && leftVersion && rightVersion) {
    const dict1Doc = await dictionaryService.findOne(name, leftVersion);
    const dict2Doc = await dictionaryService.findOne(name, rightVersion);
    const dict1 = (showReferences ? dict1Doc.toObject() : replaceReferences(dict1Doc.toObject() as DictionaryDocument)) as DictionaryDocument;
    const dict2 = (showReferences ? dict2Doc.toObject() : replaceReferences(dict2Doc.toObject() as DictionaryDocument)) as DictionaryDocument;
    const diff = diffUtil(dict1, dict2);
    res.status(200).send(Array.from(diff.entries()));
  } else {
    throw new BadRequestError('name and left and right versions must be set');
  }
};
