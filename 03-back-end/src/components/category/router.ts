import * as express from 'express';
import IApplicationResources from '../../common/IApplicationResources.interface';
import CategoryService from './service';
import CategoryController from './controller';
import IRouter from '../../common/IRouter.interface';
export default class CategoryRouther implements IRouter {
    public setupRoutes(application: express.Application, resources: IApplicationResources){
        
        //Services
        const categoryService: CategoryService = new CategoryService(resources.databaseConnection);

        //Controllers
        const categoryController: CategoryController = new CategoryController(categoryService);

        //Routing:
        application.get("/api/category", categoryController.getAll.bind(categoryController));
        application.get("/api/category/:id", categoryController.getById.bind(categoryController));
    }
}