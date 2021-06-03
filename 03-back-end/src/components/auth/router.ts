import IRouter from '../../common/IRouter.interface';
import * as express from 'express';
import IApplicationResources from '../../common/IApplicationResources.interface';
import AuthController from './controller';
import AuthMiddleware from '../../middleware/auth.middleware';
export default class AuthRouter implements IRouter {
    public setupRoutes(application: express.Application, resources: IApplicationResources) {
        // Controllers
        const authController: AuthController = new AuthController(resources);

        application.post("/api/auth/user/login", authController.userLogin.bind(authController));
        application.post("/api/auth/administrator/login", authController.administratorLogin.bind(authController));

        application.get(
            "/api/auth/user/ok",
            AuthMiddleware.getVerifier("user"),
            authController.sendOk.bind(authController)
        );

        application.get(
            "/api/auth/administrator/ok",
            AuthMiddleware.getVerifier("administrator"),
            authController.sendOk.bind(authController)
        )
    }
}