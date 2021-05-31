import IRouter from '../../common/IRouter.interface';
import * as express from 'express';
import IApplicationResources from '../../common/IApplicationResources.interface';
import UserController from './controller';

export default class UserRouter implements IRouter{
    public setupRoutes(application: express.Application, resources: IApplicationResources){
        const userController: UserController = new UserController(resources);

        application.get("/api/user", userController.getAll.bind(userController));
        application.get("/api/user/:id", userController.getById.bind(userController));
        application.post("/api/user", userController.add.bind(userController));
        application.put("/api/user/:id", userController.editById.bind(userController));
        application.delete("/api/user/:id", userController.deleteById.bind(userController));
        application.post("/api/user/register", userController.register.bind(userController));
    }
}