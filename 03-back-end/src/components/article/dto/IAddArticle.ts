import * as Ajv from "ajv"; //import Ajv from "ajv"
import FeatureModel from '../../feature/model';

const ajv = Ajv();

interface IAddArticle {
    name: string;
    excerpt: string;
    description: string;
    status: 'available' | 'visible' | 'hidden';
    isPromoted: boolean;
    price: number;
    categoryId: number;
    features: {
        featureId: number,
        value: string,
    }[];
}

interface IUploadPhoto {
    imagePath: string;
}

interface IArticleFeatureValue {
    feature: FeatureModel;
    value: string;
}

const IAddArticleSchemaValidator = ajv.compile({
    type: "object",
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
        categoryId: {
            type: "integer",
            minimum: 1,
        },
        features: {
            type: "array",
            uniqueItems: true,
            minItems: 0,
            items: {
                type: "object",
                properties: {
                    featureId: {
                        type: "number",
                        minimum: 1,
                    },
                    value: {
                        type: "string",
                        minLength: 1,
                        maxLength: 255,
                    },
                },
                required: [
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
        "categoryId",
        "features",
    ],
    additionalProperties: false,
})



export {IUploadPhoto};
export {IAddArticle};
export {IArticleFeatureValue};
export {IAddArticleSchemaValidator};