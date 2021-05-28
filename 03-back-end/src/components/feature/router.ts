import IRouter from '../../common/IRouter.interface';
import * as express from 'express';
import FeatureService from './service';
import IApplicationResources from '../../common/IApplicationResources.interface';
import FeatureController from './controller';
export default class FeatureRouter implements IRouter{
    public setupRoutes(application: express.Application, resources: IApplicationResources){
        
        //Services
        const featureService: FeatureService = new FeatureService(resources.databaseConnection);

        //Controllers
        const featureController: FeatureController = new FeatureController(featureService);

        //Routing:
        application.get("/api/feature/:cid/feature", featureController.getAllInCategory.bind(featureController));
        application.post("/api/feature", featureController.add.bind(featureController));
        application.put("/api/feature/:id", featureController.editById.bind(featureController));
        application.delete("/api/feature/:id", featureController.deleteById.bind(featureController));

    }
}