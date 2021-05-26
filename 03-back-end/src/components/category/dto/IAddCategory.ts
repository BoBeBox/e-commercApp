import * as Ajv from "ajv"; //import Ajv from "ajv"

const ajv = Ajv();

interface IAddCategory{
    name: string;
    imagePath: string;
    parentCategoryId?: number;
}

const IAddCategorySchema = {
    type: "object",
    properties: {
        name:{
            type: "string",
            minLength: 2,
            maxLength: 64,
        },
        imagePath:{
            type: "string",
            minLength: 2,
            maxLength: 255,
            pattern: "\.(png|jpg)$"
        },
        parentCategoryId: {
            type: ["intiger","null"],
            minimum: 1,
        },
    },
    required: [
        "name",
        "imagePath",
    ],
    additionalProperties: false,
}

const IAddCategorySchemaValidator = ajv.compile(IAddCategorySchema);

export {IAddCategorySchema};
export {IAddCategorySchemaValidator};
export {IAddCategory};