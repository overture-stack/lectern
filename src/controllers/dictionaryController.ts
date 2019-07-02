
import { Request, Response } from "express";
import { Dictionary, DictionaryDocument } from "../models/Dictionary";

export const listDictionaries = (req: Request, res: Response) => {
    Dictionary.find({}, "name version", (err, docs) => {
        if (err) {
            res.send("Could not save document");
            res.status(500);
            return;
        }

        res.send(docs);
        res.status(200);
    });
};

export const getDictionary = (req: Request, res: Response) => {
    res.send("okay");
    res.status(200);
};

export const createDictionary = (req: Request, res: Response) => {
    const reqBody = req.body;

    Dictionary.findOne({
        "name": reqBody.name,
        "version": reqBody.version
    }, (err, dictionary) => {
        if (err) {
            res.send("Could not save document");
            res.status(500);
            return;
        }

        if (dictionary) {
            res.send("A dictionary of that version already exists.");
            res.status(400);
            return;
        }

        const newDict = new Dictionary({
            name: reqBody.name,
            version: reqBody.version,
            files: reqBody.files
        });

        newDict.save((err) => {
            if (err) {
                res.send("Could not save document");
                res.status(500);
            }
        });

        res.send("Saved");
        res.status(200);
    });

};
