import BaseController from '../../services/BaseController';
import * as express from 'express';
import ArticleModel from './model';
import {IAddArticle, IAddArticleSchemaValidator, IUploadPhoto} from "./dto/IAddArticle";
import IErrorResponse from '../../common/IErrorResponse.interface';
import { UploadedFile } from 'express-fileupload';
import {v4 as uuidv4} from 'uuid';
import Config from '../../config/dev';

class ArticleController extends BaseController {
    async getById(req: express.Request, res: express.Response, next: express.NextFunction){
        const id: number = Number(req.params?.id);

        if(!id){
            res.sendStatus(404);
            return;
        }
        const item: ArticleModel|null = await this.services.articleService.getById(
            id,
            {
                loadCategory: true,
                loadFeature: true,
                loadPhotos: true,
                loadPrices: true
            }
        );
        if(item == null){
            res.sendStatus(404);
            return;
        }
        res.send(item);
    }

    async getUploadPhotos(req: express.Request): Promise<IUploadPhoto[]>{
        const photos: IUploadPhoto[] = [];

        if(!req.files || Object.keys(req.files).length === 0){
            return [];
        }
        const fileKeys = Object.keys(req.files);

        for(const fileKey of fileKeys){
            const file = req.files[fileKey] as UploadedFile;
            const now = new Date();
            const randomNameSegment = uuidv4();
            const uploadDestination = Config.fileUploadOptions.uploadDestinationDirectory + 
                                      (Config.fileUploadOptions.uploadDestinationDirectory.endsWith('/') ? '' : '/') +
                                      randomNameSegment + "-" + 
                                      now.getFullYear() + '/' + 
                                      ((now.getMonth() + 1) + "").padStart(2, "0")+ '/' +
                                      file?.name;

            await file.mv(uploadDestination);

            photos.push({
                imagePath: uploadDestination,
            });
        }
        return photos;
    }

    async add(req: express.Request, res: express.Response, next: express.NextFunction){
        const uploadPhotos = await this.getUploadPhotos(req);

        if(uploadPhotos.length === 0){
            res.status(400).send("You must upload at least one and a maximum of " + Config.fileUploadOptions.maxFiles + " photos.");
            return;
        }

        const itemString = req.body?.data as string;
        const item = JSON.parse(itemString);

        if(!IAddArticleSchemaValidator(item)){
            res.status(400).send(IAddArticleSchemaValidator.errors);
            return;
        }
        const newArticle: ArticleModel|IErrorResponse = await this.services.articleService.add(item as IAddArticle, uploadPhotos);
        res.send(newArticle);
    }
}

export default ArticleController;