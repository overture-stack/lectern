import { Request, Response } from "express";
import * as dictionaryService from "../services/dictionaryService";
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

export const getDictionary = async (req: Request, res: Response) => {
    const id = req.params.dictId;
    const dict = await dictionaryService.getOne(id);
    res.status(200).send(dict.toObject());
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
    if (req.params.dictId === undefined) throw new BadRequestError("Must specify valid dictId");
    const dict = await dictionaryService.updateSchema(req.params.dictId, req.body, req.query.major == true);
    res.status(200).send(dict.toObject());
};

export const diffDictionaries = async (req: Request, res: Response) => {
    const name = req.query.name;
    const leftVersion = req.query.left;
    const rightVersion = req.query.right;

    if (name && leftVersion && rightVersion) {
        const dict1 = await dictionaryService.findOne(name, leftVersion);
        const dict2 = await dictionaryService.findOne(name, rightVersion);
        const diff = diffUtil(dict1.toObject(), dict2.toObject());
        res.status(200).send(Array.from(diff.entries()));
    } else {
        throw new BadRequestError("name and left and right versions must be set");
    }
};
