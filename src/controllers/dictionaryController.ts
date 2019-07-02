
import { Request, Response, NextFunction } from "express";
import * as dictionaryService from "../services/dictionaryService";

export const listDictionaries = async (req: Request, res: Response) => {
    const dicts = await dictionaryService.listAll();
    res.send(dicts);
    res.status(200);
};

export const getDictionary = (req: Request, res: Response) => {
    res.send({"message": "okay"});
    res.status(200);
};

export const createDictionary = (req: Request, res: Response, next: NextFunction) => {
    dictionaryService.create(req.body).then(() => {
        res.status(200);
        res.send({"message": "saved"});
    }).catch(next);
};
