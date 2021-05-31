import IRouter from '../../common/IRouter.interface';
import * as express from 'express';
import IApplicationResources from '../../common/IApplicationResources.interface';
import ArticleController from './controller';
import AuthMiddleware from '../../middleware/auth.middleware';
export default class ArticleRouter implements IRouter{
    public setupRoutes(application: express.Application, resources: IApplicationResources){
        const articleController: ArticleController = new ArticleController(resources);

        application.get(
            "/api/article/:id",
            AuthMiddleware.getVerifier("user","administrator"),
            articleController.getById.bind(articleController));

        application.post(
            "/api/article", 
            AuthMiddleware.getVerifier("administrator"),
            articleController.add.bind(articleController));

        application.put(
            "/api/article/:id", 
            AuthMiddleware.getVerifier("administrator"),
            articleController.edit.bind(articleController));

        application.delete(
            "/api/article/:id", 
            AuthMiddleware.getVerifier("administrator"),
            articleController.delete.bind(articleController));

        application.delete(
            "/api/article/:aid/photo/:pid", 
            AuthMiddleware.getVerifier("administrator"),
            articleController.deleteArticlePhoto.bind(articleController));

        application.post(
            "/api/article/:id/photo/", 
            AuthMiddleware.getVerifier("administrator"),
            articleController.addArticlePhotos.bind(articleController));
    }
}