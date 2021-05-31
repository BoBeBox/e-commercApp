import IRouter from '../../common/IRouter.interface';
import * as express from 'express';
import IApplicationResources from '../../common/IApplicationResources.interface';
import AdministratorController from './controller';

export default class AdministratorRouter implements IRouter{
    public setupRoutes(application: express.Application, resources: IApplicationResources){
        const administratorController: AdministratorController = new AdministratorController(resources);

        application.get("/api/administrator", administratorController.getAll.bind(administratorController));
        application.get("/api/administrator/:id", administratorController.getById.bind(administratorController));
        application.post("/api/administrator", administratorController.add.bind(administratorController));
        application.put("/api/administrator/:id", administratorController.editById.bind(administratorController));
        application.delete("/api/administrator/:id", administratorController.deleteById.bind(administratorController));
    }
}