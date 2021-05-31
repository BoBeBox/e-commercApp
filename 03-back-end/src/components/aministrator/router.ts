import IRouter from '../../common/IRouter.interface';
import * as express from 'express';
import IApplicationResources from '../../common/IApplicationResources.interface';
import AdministratorController from './controller';
import AuthMiddleware from '../../middleware/auth.middleware';

export default class AdministratorRouter implements IRouter{
    public setupRoutes(application: express.Application, resources: IApplicationResources){
        const administratorController: AdministratorController = new AdministratorController(resources);

        application.get(
            "/api/administrator",
            AuthMiddleware.getVerifier("administrator"),
            administratorController.getAll.bind(administratorController));

        application.get(
            "/api/administrator/:id", 
            AuthMiddleware.getVerifier("administrator"),
            administratorController.getById.bind(administratorController));

        application.post(
            "/api/administrator",
            AuthMiddleware.getVerifier("administrator"),
            administratorController.add.bind(administratorController));

        application.put(
            "/api/administrator/:id", 
            AuthMiddleware.getVerifier("administrator"),
            administratorController.editById.bind(administratorController));

        application.delete(
            "/api/administrator/:id", 
            AuthMiddleware.getVerifier("administrator"),
            administratorController.deleteById.bind(administratorController));
    }
}