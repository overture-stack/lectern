
import { Request, Response, NextFunction } from "express";
import * as dictionaryService from "../services/dictionaryService";
import { DictionaryDocument } from "../models/Dictionary";

export const listDictionaries = async (req: Request, res: Response) => {
    const name = req.query.name;
    const version = req.query.version;

    if (name && version) {
        const dict = await dictionaryService.findOne(name, version);
        res.send([dict]);
        res.status(200);
    } else {
        const dicts = await dictionaryService.listAll();
        res.send(dicts);
        res.status(200);
    }
};

export const createDictionary = (req: Request, res: Response, next: NextFunction) => {
    dictionaryService.create(req.body).then((dict: DictionaryDocument) => {
        res.status(200);
        res.send(dict.toObject());
    }).catch(next);
};

export const addFile = (req: Request, res: Response, next: NextFunction) => {
    dictionaryService.addFile(req.query.name, req.query.version, req.body).then((dict: DictionaryDocument) => {
        res.status(200);
        res.send(dict.toObject());
    }).catch(next);
};

export const updateFile = (req: Request, res: Response, next: NextFunction) => {
    dictionaryService.updateFile(req.query.name, req.query.version, req.body, req.query.major == true).then((dict: DictionaryDocument) => {
        res.status(200);
        res.send(dict.toObject());
    }).catch(next);
};
