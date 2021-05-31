import { Request, Response, NextFunction } from "express";
import Config from '../config/dev';
import * as jwt from 'jsonwebtoken';
import ITokenData from '../components/auth/dto/ITokenData.interface';

export default class AuthMiddleware {
    private static verifyAuthToken(req: Request, res: Response, next: NextFunction, allowedRoles: ("user"|"administrator")[]) {
        if (typeof req.headers.authorization !== "string") {
            return res.status(401).send("No auth token specified.");
        }

        const token: string = req.headers.authorization;

        const [ tokenType, tokenString ] = token.trim().split(" ");

        if (tokenType !== "Bearer") {
            return res.status(400).send("Invalid auth token type specified.");
        }

        if (typeof tokenString !== "string") {
            return res.status(400).send("Invalid auth token value specified.");
        }

        if (tokenString.length === 0) {
            return res.status(400).send("Invalid auth token length.");
        }

        let result;

        try {
            result = jwt.verify(tokenString.trim(), Config.auth.user.authToken.publicKey.trim(), {
                issuer: Config.auth.user.issuer,
                algorithms: [ Config.auth.user.algorithm, ]
            });
        } catch (e) {
            return res.status(500).send("Token validation error: " + e?.message);
        }

        if (typeof result !== "object") {
            return res.status(400).send("Bad auth token data.");
        }

        req.authorized = result as ITokenData;

        if (!allowedRoles.includes(req.authorized?.role)) {
            return res.status(401).send("Access denied to this role.");
        }

        next();
    }

    public static getVerifier(
        ...allowedRoles:("user"|"administrator")[]
    ): (req: Request, res: Response, next: NextFunction) => void{
        return(req: Request, res: Response, next: NextFunction) =>{
        this.verifyAuthToken(req,res,next,allowedRoles);
        }
    }
}