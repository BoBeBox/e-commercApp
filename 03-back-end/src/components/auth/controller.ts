import BaseController from '../../services/BaseController';
import { IUserLogin, IUserLoginSchemaValidator } from './dto/IUserLogin';
import { Request, Response } from "express";
import * as bcrypt from 'bcrypt';
import Config from '../../config/dev';
import * as jwt from "jsonwebtoken";
import { IAdministratorLogin, IAdministratorLoginSchemaValidator } from './dto/IAdministratodLogin';
import ITokenData from './dto/ITokenData.interface';

export default class AuthController extends BaseController{
    public async userLogin(req: Request, res: Response) {
        if (!IUserLoginSchemaValidator(req.body)) {
            return res.status(400).send(IUserLoginSchemaValidator.errors);
        }

        const data = req.body as IUserLogin;
        const user = await this.services.userService.getByEmail(data.email);

        if (user === null) {
            return res.sendStatus(404);
        }
        //logika za anti brute force
        if (!bcrypt.compareSync(data.password, user.passwordHash)) {
            await new Promise(resolve => setTimeout(resolve, 1000));

            return res.status(403).send("Invalid user password.");
        }

        const authTokenData: ITokenData = {
            id: user.userId,
            identity: user.email,
            role: "user",
        };

        const authToken = jwt.sign(authTokenData, Config.auth.user.authToken.privateKey, {
            algorithm: Config.auth.user.algorithm,
            issuer: Config.auth.user.issuer,
            expiresIn: Config.auth.user.authToken.duration,
        });

        const refreshTokenData: ITokenData = {
            id: user.userId,
            identity: user.email,
            role: "user",
        };

        const refreshToken = jwt.sign(refreshTokenData, Config.auth.user.refreshToken.privateKey, {
            algorithm: Config.auth.user.algorithm,
            issuer: Config.auth.user.issuer,
            expiresIn: Config.auth.user.refreshToken.duration,
        });
        res.send({
            "authToken": authToken,
            "refreshToken": refreshToken,
        });
    }
    public async administratorLogin(req: Request, res: Response) {
        if (!IAdministratorLoginSchemaValidator(req.body)) {
            return res.status(400).send(IAdministratorLoginSchemaValidator.errors);
        }

        const data = req.body as IAdministratorLogin;
        const administrator = await this.services.administratorService.getByUsername(data.username);

        if (administrator === null) {
            return res.sendStatus(404);
        }
        //logika za anti brute force
        if (!bcrypt.compareSync(data.password, administrator.passwordHash)) {
            await new Promise(resolve => setTimeout(resolve, 1000));

            return res.status(403).send("Invalid administrator password.");
        }

        const authTokenData: ITokenData = {
            id: administrator.administratorId,
            identity: administrator.username,
            role: "administrator",
        };

        const authToken = jwt.sign(authTokenData, Config.auth.administrator.authToken.privateKey, {
            algorithm: Config.auth.administrator.algorithm,
            issuer: Config.auth.administrator.issuer,
            expiresIn: Config.auth.administrator.authToken.duration,
        });

        const refreshTokenData: ITokenData = {
            id: administrator.administratorId,
            identity: administrator.username,
            role: "administrator",
        };

        const refreshToken = jwt.sign(refreshTokenData, Config.auth.administrator.refreshToken.privateKey, {
            algorithm: Config.auth.administrator.algorithm,
            issuer: Config.auth.administrator.issuer,
            expiresIn: Config.auth.administrator.refreshToken.duration,
        });

        res.send({
            "authToken": authToken,
            "refreshToken": refreshToken,
        });
    }

    public sendOk(req: Request, res: Response) {
        res.send("OK");
    }
}