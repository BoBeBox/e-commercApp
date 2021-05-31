import * as Ajv from "ajv";

const ajv = Ajv();

interface IUserLogin {
    email: string;
    password: string;
}

const IUserLoginSchemaValidator = ajv.compile({
    type: "object",
    properties: {
        email: {
            type: "string",
            minLength: 5,
            maxLength: 255,
        },
        password: {
            type: "string",
            minLength: 5,
            maxLength: 128
        },
    },
    required: [
        "email",
        "password",
    ],
    additionalProperties: false,
});

export { IUserLoginSchemaValidator };
export { IUserLogin };