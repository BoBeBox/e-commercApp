import * as Ajv from "ajv"; //import Ajv from "ajv"

const ajv = Ajv();

interface IEditArticle {
    name: string;
    excerpt: string;
    description: string;
    status: 'available' | 'visible' | 'hidden';
    isPromoted: boolean;
    price: number;
    features: {
        featureId: number,
        value: string,
    }[];
}

const IEditArticleSchemaValidator = ajv.compile({
    tupe: "object",
    properties: {
        name: {
            type: "string",
            minLength: 2,
            maxLength: 128,
        },
        excerpt: {
            type: "string",
            minLength: 2,
            maxLength: 255,
        },
        description: {
            type: "string",
            minLength: 2,
            maxLength: 65536,
        },
        status: {
            type: "string",
            enum: ['available', 'visible', 'hidden'],
        },
        isPromoted: {
            type: "boolean",
        },
        price: {
            type: "number",
            minimum: 0.01,
            multipleOf: 0.01
        },
        features:{
            type: "array",
            uniqueItems: true,
            minItems: 0,
            items:{
                type: "object",
                properties:{
                    featureId:{
                        type: "number",
                        minumum: 1,
                    },
                    value:{
                        type: "string",
                        minLength: 1,
                        maxLength: 255,
                    },
                },
                required:[
                    "featureId",
                    "value",
                ],
                additionalProperties: false,
            },
        },
    },
    required: [
        "name",
        "excerpt",
        "description",
        "status",
        "isPromoted",
        "price",
        "features",
    ],
    additionalProperties: false
});

export {IEditArticleSchemaValidator};
export {IEditArticle};