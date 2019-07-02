
import { Request, Response } from "express";
import { Dictionary, DictionaryDocument } from "../models/Dictionary";

export const listDictionaries = (req: Request, res: Response) => {
    res.send("okay");
    res.status(200);
};

export const getDictionary = (req: Request, res: Response) => {
    res.send("okay");
    res.status(200);
};

export const createDictionary = (req: Request, res: Response) => {
    console.log(req.body);
    res.send("okay");
    res.status(200);
};
