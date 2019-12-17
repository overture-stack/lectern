import mongoose from 'mongoose';

export type DictionaryDocument = mongoose.Document & {
  name: string;
  version: string;
  schemas: any[];
  references: any;
};

const DictionarySchema = new mongoose.Schema(
  {
    name: String,
    version: String,
    schemas: Array,
    references: Object,
  },
  { timestamps: true },
);

export const Dictionary = mongoose.model<DictionaryDocument>('Dictionary', DictionarySchema);
