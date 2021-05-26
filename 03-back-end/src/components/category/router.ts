import * as express from 'express';
import IApplicationResources from '../../services/IApplicationResources.interface';
import CategoryService from './service';
import CategoryController from './controller';
export default class CategoryRouther {
    public static setupRouter(application: express.Application, resources: IApplicationResources){
        
        //Services
        const categoryService: CategoryService = new CategoryService()

        //Controllers
        const categoryController: CategoryController = new CategoryController(categoryService);

        //Routing:
        application.get("/api/category", categoryController.getAll.bind(categoryController));
        application.get("/api/category/:id", categoryController.getById.bind(categoryController));
    }
}