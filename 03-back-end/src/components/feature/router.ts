import IRouter from '../../common/IRouter.interface';
import * as express from 'express';
import FeatureService from './service';
import IApplicationResources from '../../common/IApplicationResources.interface';
import FeatureController from './controller';
import AuthMiddleware from '../../middleware/auth.middleware';
export default class FeatureRouter implements IRouter{
    public setupRoutes(application: express.Application, resources: IApplicationResources){

        //Controllers
        const featureController: FeatureController = new FeatureController(resources);

        //Routing:
        application.get(
            "/api/category/:cid/feature", 
            AuthMiddleware.getVerifier("user","administrator"),
            featureController.getAllInCategory.bind(featureController));

        application.post(
            "/api/feature", 
            AuthMiddleware.getVerifier("administrator"),
            featureController.add.bind(featureController));

        application.put(
            "/api/feature/:id", 
            AuthMiddleware.getVerifier("administrator"),
            featureController.editById.bind(featureController));

        application.delete(
            "/api/feature/:id", 
            AuthMiddleware.getVerifier("administrator"),
            featureController.deleteById.bind(featureController));

    }
};