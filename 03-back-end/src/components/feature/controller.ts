import FeatureService from "./service"
import * as express from 'express';
import { IAddFeature, IAddFeatureSchemaValidator } from "./dto/IAddFeature";
import FeatureModel from './model';
import IErrorResponse from '../../common/IErrorResponse.interface';
import { IEditFeature, IEditFeatureSchemaValidator } from "./dto/IEditFeature";
import BaseController from '../../services/BaseController';
class FeatureController extends BaseController{
    async getAllInCategory(req: express.Request, res: express.Response, next: express.NextFunction){
        const categoryId: number = +req.params?.cid; //cid ili id?
        res.send(await this.services.featureService.getAllByParentCategoryId(categoryId))
    }

    async add(req: express.Request, res: express.Response, next: express.NextFunction){
        const item = req.body;

        if(!IAddFeatureSchemaValidator(item)){
            res.status(400).send(IAddFeatureSchemaValidator.errors);
            return;
        }

        const data: IAddFeature = item;

        const newFeature: FeatureModel|IErrorResponse = await this.services.featureService.add(item as IAddFeature);

        res.send(newFeature);
    }

    async editById(req: express.Request, res: express.Response, next: express.NextFunction){
        const item = req.body;
        const featureId = Number(req.params.id);

        if(featureId <= 0){
            res.status(400).send(["The featured ID must be a numerical value larger than 0."]);
            return;
        }

        if(!IEditFeatureSchemaValidator(item)){
            res.status(400).send(IEditFeatureSchemaValidator.errors);
            return;
        }

        const data: IEditFeature = item;

        const editedFeature: FeatureModel|IErrorResponse = await this.services.featureService.edit(featureId, item as IEditFeature);

        res.send(editedFeature);
    }

    async deleteById(req: express.Request, res: express.Response, next: express.NextFunction){
        const featureId = Number(req.params.id);

        if(featureId <= 0){
            res.status(400).send(["The feature ID must be a numerical value larger than 0."]);
            return;
        }
        
        res.send(await this.services.featureService.delete(featureId));
    }
}

export default FeatureController;