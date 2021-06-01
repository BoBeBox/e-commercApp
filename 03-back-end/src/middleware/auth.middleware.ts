import { Request, Response, NextFunction } from "express";
import Config from '../config/dev';
import * as jwt from 'jsonwebtoken';
import ITokenData from '../components/auth/dto/ITokenData.interface';

interface TokenValidationInformation {
    isValid: boolean;
    data: any;
}
export default class AuthMiddleware {
    private static verifyAuthToken(req: Request, res: Response, next: NextFunction, allowedRoles: ("user"|"administrator")[]) {
        if(Config.auth.allowRequestsEvenWithoutValidTokens){
            return next();
        }
        
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

        const userTokenValidation = this.validateTokenAsTokenByRole(tokenString, "user");
        const administratorTokenValidation = this.validateTokenAsTokenByRole(tokenString, "administrator");

        let result;

        if (userTokenValidation.isValid === false && administratorTokenValidation.isValid === false) {
            return res.status(401).send("Token validation error: " + JSON.stringify(userTokenValidation) + " " + JSON.stringify(administratorTokenValidation));
        }

        if (userTokenValidation.isValid) {
            result = userTokenValidation.data;
        } else {
            result = administratorTokenValidation.data;
        }

        if (typeof result !== "object") {
            return res.status(401).send("Bad auth token data.");
        }

        const data: ITokenData = result as ITokenData;

        if (!allowedRoles.includes(data.role)) {
            return res.status(403).send("Access denied to this role.");
        }

        req.authorized = data;

        next();
    }

    private static validateTokenAsTokenByRole(tokenString: string, role: ("user"|"administrator")): TokenValidationInformation {
        try {
            const result = jwt.verify(tokenString, Config.auth[role].authToken.publicKey);
            return {
                isValid: true,
                data: result,
            };
        } catch (e) {
            return {
                isValid: false,
                data: e?.message,
            };
        }
    }

    public static getVerifier(
        ...allowedRoles: ("user"|"administrator")[]
    ): (req: Request, res: Response, next: NextFunction) => void {
        return (req: Request, res: Response, next: NextFunction) => {
            this.verifyAuthToken(req, res, next, allowedRoles);
        };
    }
}