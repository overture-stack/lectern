import MetaSchema from "../config/MetaSchema.json";
import Ajv from "ajv";

export function validate(dictionary: any) {
    const ajv = new Ajv({
        allErrors: true,
        jsonPointers: true
    });
    const validate = ajv.compile(MetaSchema);
    return { valid: validate(dictionary), errors: validate.errors};
}
