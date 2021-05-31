import IRouter from '../../common/IRouter.interface';
import * as express from 'express';
import IApplicationResources from '../../common/IApplicationResources.interface';
import ArticleController from './controller';
export default class ArticleRouter implements IRouter{
    public setupRoutes(application: express.Application, resources: IApplicationResources){
        const articleController: ArticleController = new ArticleController(resources);

        application.get("/api/article/:id", articleController.getById.bind(articleController));
        application.post("/api/article", articleController.add.bind(articleController));
        application.put("/api/article/:id", articleController.edit.bind(articleController));
        application.delete("/api/article/:id", articleController.delete.bind(articleController));
    }
}