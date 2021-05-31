import IRouter from '../../common/IRouter.interface';
import * as express from 'express';
import IApplicationResources from '../../common/IApplicationResources.interface';
import AuthController from './controller';
export default class AuthRouter implements IRouter {
    public setupRoutes(application: express.Application, resources: IApplicationResources) {
        // Controllers
        const authController: AuthController = new AuthController(resources);

        application.post("/api/auth/user/login", authController.userLogin.bind(authController));
        application.post("/api/auth/administrator/login", authController.administratorLogin.bind(authController));
    }
}