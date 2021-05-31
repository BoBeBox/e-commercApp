import * as express from 'express';
import IApplicationResources from '../../common/IApplicationResources.interface';
import CategoryService from './service';
import CategoryController from './controller';
import IRouter from '../../common/IRouter.interface';
import AuthMiddleware from '../../middleware/auth.middleware';
export default class CategoryRouther implements IRouter {
    public setupRoutes(application: express.Application, resources: IApplicationResources){

        //Controllers
        const categoryController: CategoryController = new CategoryController(resources);

        //Routing:
        application.get(
            "/api/category", 
            AuthMiddleware.getVerifier("user","administrator"),
            categoryController.getAll.bind(categoryController));

        application.get(
            "/api/category/:id",
            AuthMiddleware.getVerifier("user", "administrator"),
            categoryController.getById.bind(categoryController));

        application.post(
            "/api/category",
            AuthMiddleware.getVerifier("administrator"),
            categoryController.add.bind(categoryController));

        application.put(
            "/api/category/:id",
            AuthMiddleware.getVerifier("administrator"),
            categoryController.editById.bind(categoryController));

        application.delete(
            "/api/category/:id",
            AuthMiddleware.getVerifier("administrator"),
            categoryController.deleteById.bind(categoryController));
    }
}