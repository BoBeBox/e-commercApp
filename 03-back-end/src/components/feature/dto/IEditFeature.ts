import * as Ajv from "ajv"; //import Ajv from "ajv"

const ajv = Ajv();

interface IEditFeature{
    name: string;
    categoryId: number;
}

const IEditFeatureSchemaValidator = ajv.compile({
    type:"object",
    properties: { 
        name:{
            type:"string",
            minLength: 2,
            maxLength: 64,
        },
        categoryId:{
            tupe: "integet",
            minimum: 1,
        },
    },
    required: [
        "name",
        "categoryId",
    ],
    additionalProperties: false,
});

export {IEditFeatureSchemaValidator};
export {IEditFeature};