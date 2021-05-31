import * as Ajv from "ajv";

const ajv = Ajv();

interface IAddAdministrator {
    username: string;
    password: string;
}

const IAddAdministratorSchemaValidator = ajv.compile({
    type: "object",
    properties: {
        username: {
            type: "string",
            minLength: 5,
            maxLength: 32,
        },
        password: {
            type: "string",
            minLength: 5,
            maxLength: 128
        },
    },
    required: [
        "username",
        "password",
    ],
    additionalProperties: false,
});

export { IAddAdministratorSchemaValidator };
export { IAddAdministrator };
