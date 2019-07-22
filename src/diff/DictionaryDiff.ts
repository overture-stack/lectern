import { DictionaryDocument } from "../models/Dictionary";

enum FileChange {
    ADDED,
    REMOVED
}

interface Field {
    name?: string;
    description: string;
    type: string;
    meta: any;
    restriction: any;
}

interface FieldDiff {
    leftDiff?: Field;
    rightDiff?: Field;
}

interface FileDiff {
    operation: FileChange;
    name: string;
}

interface DictionaryDiffReport {
    files: FileDiff[];
    fields: FieldDiff[];
}

export const diff = (dict1: DictionaryDocument, dict2: DictionaryDocument): DictionaryDiffReport => {
    return undefined;
};

