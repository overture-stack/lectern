
import { Request, Response, NextFunction } from "express";
import * as dictionaryService from "../services/dictionaryService";
import { DictionaryDocument } from "../models/Dictionary";
import { BadRequestError } from "../utils/errors";
import { diff as diffUtil } from "../diff/DictionaryDiff";

export const listDictionaries = async (req: Request, res: Response) => {
    const name = req.query.name;
    const version = req.query.version;

    if (name && version) {
        const dict = await dictionaryService.findOne(name, version);
        res.status(200).send([dict]);
    } else {
        const dicts = await dictionaryService.listAll();
        res.status(200).send(dicts);
    }
};

export const getDictionary = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.dictId;
    dictionaryService.getOne(id).then((dict: DictionaryDocument) => {
        res.status(200).send(dict.toObject());
    }).catch(next);
};

export const createDictionary = (req: Request, res: Response, next: NextFunction) => {
    dictionaryService.create(req.body).then((dict: DictionaryDocument) => {
        res.status(200).send(dict.toObject());
    }).catch(next);
};

export const addFile = (req: Request, res: Response, next: NextFunction) => {
    dictionaryService.addFile(req.params.dictId, req.body).then((dict: DictionaryDocument) => {
        res.status(200).send(dict.toObject());
    }).catch(next);
};

export const updateFile = (req: Request, res: Response, next: NextFunction) => {
    dictionaryService.updateFile(req.params.dictId, req.body, req.query.major == true).then((dict: DictionaryDocument) => {
        res.status(200).send(dict.toObject());
    }).catch(next);
};

export const diffDictionaries = async (req: Request, res: Response, next: NextFunction) => {
    const name = req.query.name;
    const leftVersion = req.query.left;
    const rightVersion = req.query.right;

    if (name && leftVersion && rightVersion) {
        const dict1 = await dictionaryService.findOne(name, leftVersion);
        const dict2 = await dictionaryService.findOne(name, rightVersion);
        const diff = diffUtil(dict1.toObject(), dict2.toObject());
        res.status(200).send(Array.from(diff.entries()));
    } else {
        next(new BadRequestError("name and left and right versions must be set"));
    }
};
