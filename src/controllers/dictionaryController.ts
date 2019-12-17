import { Request, Response } from 'express';
import * as dictionaryService from '../services/dictionaryService';
import { BadRequestError } from '../utils/errors';
import { diff as diffUtil } from '../diff/DictionaryDiff';
import logger from '../config/logger';

export const listDictionaries = async (req: Request, res: Response) => {
  const name = req.query.name;
  const version = req.query.version;
  const showReferences = req.query.references || false;

  if (name && version) {
    const dict = await dictionaryService.findOne(name, version);
    const response = showReferences
      ? dict.toObject()
      : dictionaryService.replaceReferences(dict.toObject());
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
  const response = showReferences
    ? dict.toObject()
    : dictionaryService.replaceReferences(dict.toObject());
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
  const name = req.query.name;
  const leftVersion = req.query.left;
  const rightVersion = req.query.right;

  if (name && leftVersion && rightVersion) {
    const dict1Doc = await dictionaryService.findOne(name, leftVersion);
    const dict2Doc = await dictionaryService.findOne(name, rightVersion);
    const dict1 = showReferences
      ? dict1Doc.toObject()
      : dictionaryService.replaceReferences(dict1Doc.toObject());
    const dict2 = showReferences
      ? dict2Doc.toObject()
      : dictionaryService.replaceReferences(dict2Doc.toObject());
    const diff = diffUtil(dict1, dict2);
    res.status(200).send(Array.from(diff.entries()));
  } else {
    throw new BadRequestError('name and left and right versions must be set');
  }
};
