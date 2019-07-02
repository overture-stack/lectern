import mongoose from "mongoose";

export type DictionaryDocument = mongoose.Document & {
    name: string;
    version: string;
    files: any[];
};

const DictionarySchema = new mongoose.Schema({
    name: String,
    version: String,
    files: Array
}, { timestamps: true });


export const Dictionary = mongoose.model<DictionaryDocument>("Dictionary", DictionarySchema);
