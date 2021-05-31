import BaseController from '../../services/BaseController';
import * as express from 'express';
import ArticleModel from './model';
import {IAddArticle, IAddArticleSchemaValidator, IUploadPhoto} from "./dto/IAddArticle";
import IErrorResponse from '../../common/IErrorResponse.interface';
import { UploadedFile } from 'express-fileupload';
import {v4 as uuidv4} from 'uuid';
import Config from '../../config/dev';
import * as fs from 'fs';
import sizeOf from "image-size";
import * as path from 'path';
import sharp = require('sharp');

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

    private isImageValid(file: UploadedFile): {
        isOk: boolean;
        message?: string;   
    }{
        const size = sizeOf(file.tempFilePath);
        if(size.width < Config.fileUploadOptions.photos.limits.minWidth){
            fs.unlinkSync(file.tempFilePath);
            return{
                isOk:false,
                message: "The image must have a width of at least " + Config.fileUploadOptions.photos.limits.minWidth + "px",
            };
        }
        if(size.height < Config.fileUploadOptions.photos.limits.minHeight){
            fs.unlinkSync(file.tempFilePath);
            return{
                isOk:false,
                message: "The image must have a height of at least " + Config.fileUploadOptions.photos.limits.minHeight + "px",
            };
        }
        if(size.width > Config.fileUploadOptions.photos.limits.maxWidth){
            fs.unlinkSync(file.tempFilePath);
            return{
                isOk:false,
                message: "The image cannot have width larger than " + Config.fileUploadOptions.photos.limits.maxWidth + "px",
            };
        }
        if(size.height > Config.fileUploadOptions.photos.limits.maxHeight){
            fs.unlinkSync(file.tempFilePath);
            return{
                isOk:false,
                message: "The image cannot have width larger than " + Config.fileUploadOptions.photos.limits.maxHeight + "px",
            };
        }
        return{
            isOk:true,
        };
    }

    private async resizeUploadImage(directory: string, filename: string) {
        for(const resizeSpecification of Config.fileUploadOptions.photos.resizings){
            const parsedFilename = path.parse(filename);
            const namePart = parsedFilename.name;
            const extPart = parsedFilename.ext;

            await sharp(directory + filename)
            .resize({
                width: resizeSpecification.width,
                height: resizeSpecification.height,
                fit: resizeSpecification.fit,
                withoutEnlargement: true,
                background: {
                    r: 255,
                    g: 255,
                    b: 255,
                    alpha: 1,
                },
            })
            .toFile(directory + namePart + resizeSpecification.sufix + extPart); //gradjenje putanje slike
        }
    }

    async getUploadPhotos(req: express.Request, res: express.Response): Promise<IUploadPhoto[]>{
        const photos: IUploadPhoto[] = [];

        if(!req.files || Object.keys(req.files).length === 0){
            res.status(400).send("At leas one photo must be uploaded, or maximum of " + Config.fileUploadOptions.maxFiles + " photos.")
            return [];
        }
        const fileKeys = Object.keys(req.files);

        for(const fileKey of fileKeys){
            const file = req.files[fileKey] as UploadedFile;

            const imageValidation = this.isImageValid(file);
            if(imageValidation.isOk === false){
                res.status(400).send(`Error width image ${fileKey}: ${imageValidation?.message}.`);
                return [];
            }

            const now = new Date();
            const randomNameSegment = uuidv4(); //generisanje univerzalnih jedinstvenih identifikatora
            const uploadDirectory = Config.fileUploadOptions.uploadDestinationDirectory + 
                                      (Config.fileUploadOptions.uploadDestinationDirectory.endsWith('/') ? '' : '/') +
                                      randomNameSegment + "-" + 
                                      now.getFullYear() + '/' + 
                                      ((now.getMonth() + 1) + "").padStart(2, "0")+ '/';
            const filename = randomNameSegment + "-" + file?.name;
            const uploadDestination = uploadDirectory + filename;

            await file.mv(uploadDestination);
            await this.resizeUploadImage(uploadDirectory, filename);

            photos.push({
                imagePath: uploadDestination,
            });
        }
        return photos;
    }

    async add(req: express.Request, res: express.Response, next: express.NextFunction){
        const uploadPhotos = await this.getUploadPhotos(req, res);

        if(uploadPhotos.length === 0){
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