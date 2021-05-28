import * as Ajv from "ajv"; //import Ajv from "ajv"

const ajv = Ajv();

interface IAddFeature{
    name: string;
    categoryId: number;
}

const IAddFeatureSchemaValidator = ajv.compile({
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

export {IAddFeatureSchemaValidator};
export {IAddFeature};