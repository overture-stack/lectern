import mongoose from 'mongoose';

export type DictionaryDocument = mongoose.Document & {
  name: string;
  version: string;
  schemas: any[];
};

const DictionarySchema = new mongoose.Schema(
  {
    name: String,
    version: String,
    schemas: Array,
  },
  { timestamps: true },
);

export const Dictionary = mongoose.model<DictionaryDocument>('Dictionary', DictionarySchema);
