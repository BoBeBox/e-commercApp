import * as Ajv from "ajv";

const ajv = Ajv();

interface IEditAdministrator {
    password: string;
}

const IEditAdministratorSchemaValidator = ajv.compile({
    type: "object",
    properties: {
        password: {
            type: "string",
            minLength: 5,
            maxLength: 128
        },
    },
    required: [
        "password",
    ],
    additionalProperties: false,
});

export { IEditAdministratorSchemaValidator };
export { IEditAdministrator };
