import * as Ajv from "ajv"; //import Ajv from "ajv"

const ajv = Ajv();

interface IEditCategory{
    name: string;
    imagePath: string;
    parentCategoryId?: number;
}

const IEditCategorySchema = {
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
            type: ["integer", "null"],
            minimum: 1,
        },
    },
    required: [
        "name",
        "imagePath",
    ],
    additionalProperties: false,
}

const IEditCategorySchemaValidator = ajv.compile(IEditCategorySchema);

export {IEditCategorySchema};
export {IEditCategorySchemaValidator};
export {IEditCategory};