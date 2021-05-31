import BaseController from '../../services/BaseController';
import * as express from 'express';
import UserModel from './model';
import { IAddUser, IAddUserSchemaValidator } from './dto/IAddUser';
import IErrorResponse from '../../common/IErrorResponse.interface';
import { IEditUser, IEditUserSchemaValidator } from './dto/IEditUser';
import Config from '../../config/dev';
import * as nodemailer from 'nodemailer';
import Mail = require('nodemailer/lib/mailer');

class UserController extends BaseController {
    async getAll(req: express.Request, res: express.Response, next: express.NextFunction){
        res.send(await this.services.userService.getAll());
    }
    
    async getById(req: express.Request, res: express.Response, next: express.NextFunction) {
        const id: number = Number(req.params?.id);

        if (!id) {
            res.sendStatus(404);
            return;
        }

        const item: UserModel| null = await this.services.userService.getById(id);

        if (item == null) {
            res.sendStatus(404);
            return;
        }

        res.send(item);
    }

    async add(req: express.Request, res: express.Response, next: express.NextFunction) {
        const item = req.body;

        if (!IAddUserSchemaValidator(item)) {
            res.status(400).send(IAddUserSchemaValidator.errors);
            return;
        }

        const data: IAddUser = item;

        const newUser: UserModel|IErrorResponse = await this.services.userService.add(data);

        res.send(newUser);
    }

    async editById(req: express.Request, res: express.Response, next: express.NextFunction) {
        const item = req.body;
        const userId = Number(req.params.id);

        if (userId <= 0) {
            res.status(400).send(["The user ID must be a numerical value larger than 0."]);
            return;
        }

        if (!IEditUserSchemaValidator(item)) {
            res.status(400).send(IEditUserSchemaValidator.errors);
            return;
        }

        const data: IEditUser = item;

        const editedUser: UserModel|IErrorResponse = await this.services.userService.edit(userId, data);

        res.send(editedUser);

    }

    async deleteById(req: express.Request, res: express.Response, next: express.NextFunction) {
        const userId = Number(req.params.id);

        if (userId <= 0) {
            res.status(400).send(["The user ID must be a numerical value larger than 0."]);
            return;
        }

        res.send(await this.services.userService.delete(userId));
    }

    private async sendRegistrationEmail(userData: UserModel): Promise<IErrorResponse> {
        return new Promise<IErrorResponse>(async resolve => {
            const transport = nodemailer.createTransport(
                {
                    host: Config.mail.hostname,
                    port: Config.mail.port,
                    secure: Config.mail.secure,
                    auth: {
                        user: Config.mail.username,
                        pass: Config.mail.password,
                    },
                    debug: Config.mail.debug,
                },
                {
                    from: Config.mail.fromEmail,
                }
            );

            const mailOptions: Mail.Options = {
                to: userData.email,
                subject: "Account registration",
                html: `<!doctype html>
                        <html>
                            <head>
                                <meta charset="utf-8">
                            </head>
                            <body>
                                <p>
                                    Dear ${userData.forename} ${userData.surname},<br>
                                    Your account was successfully created.
                                </p>
                                <p>
                                    Your account can be accessed with your email and the password that you have set in the registration form.
                                </p>
                            </body>
                        </html>`,
            };

            const closeTransportAndResolve = async (data: IErrorResponse) => {
                transport.close();
                resolve(data);
            }

            transport.sendMail(mailOptions)
                .then(() => {
                    closeTransportAndResolve({
                        errorCode: 0,
                        message: "",
                    });
                })
                .catch(error => {
                    closeTransportAndResolve({
                        errorCode: -1,
                        message: error?.message,
                    });
                });
        });
    }

    async register(req: express.Request, res: express.Response) {
        const item = req.body;

        if (!IAddUserSchemaValidator(item)) {
            return res.status(400).send(IAddUserSchemaValidator.errors);
        }

        const result: UserModel|IErrorResponse = await this.services.userService.add(req.body as IAddUser);

        if (!(result instanceof UserModel)) {
            if (result.message.includes("uq_user_email")) {
                return res.status(400).send({
                    errorCode: result.errorCode,
                    message: "An account with this information already exists.",
                });
            }

            return res.status(400).send(result);
        }

        const mailSent: IErrorResponse = await this.sendRegistrationEmail(result);

        if (mailSent.errorCode !== 0) {
            console.log("Could not send email. Error: " + mailSent.message);
        }

        res.send(result);
    }
}

export default UserController;