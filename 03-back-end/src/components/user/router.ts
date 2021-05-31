import IRouter from '../../common/IRouter.interface';
import * as express from 'express';
import IApplicationResources from '../../common/IApplicationResources.interface';
import UserController from './controller';
import AuthMiddleware from '../../middleware/auth.middleware';

export default class UserRouter implements IRouter{
    public setupRoutes(application: express.Application, resources: IApplicationResources){
        const userController: UserController = new UserController(resources);

        application.get(
            "/api/user", 
            AuthMiddleware.getVerifier("user","administrator"),
            userController.getAll.bind(userController));

        application.get(
            "/api/user/:id", 
            AuthMiddleware.getVerifier("user","administrator"),
            userController.getById.bind(userController));

        application.post(
            "/api/user", 
            AuthMiddleware.getVerifier("administrator"),
            userController.add.bind(userController));

        application.put(
            "/api/user/:id", 
            AuthMiddleware.getVerifier("administrator"),
            userController.editById.bind(userController));

        application.delete(
            "/api/user/:id", 
            AuthMiddleware.getVerifier("administrator"),
            userController.deleteById.bind(userController));
        //bilo ko moze da se regristruje, zato ne stavljamo nikakvu rolu za middleware
        application.post(
            "/api/user/register", 
            userController.register.bind(userController));
    }
}