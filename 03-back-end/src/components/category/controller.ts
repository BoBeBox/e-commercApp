import CategoryService from './service';

import * as express from 'express';
import CategoryModel from './model';
import { IAddCategory, IAddCategorySchemaValidator } from './dto/IAddCategory';
import IErrorResponse from '../../common/IErrorResponse.interface';
import { IEditCategory, IEditCategorySchemaValidator } from './dto/IEditCategory';
import BaseController from '../../services/BaseController';

class CategoryController extends BaseController{
    

    async getAll (req: express.Request, res: express.Response, next: express.NextFunction){
        res.send(await this.services.categoryService.getAll());
    }

    async getById (req: express.Request, res: express.Response, next: express.NextFunction){
        const id: number = Number(req.params?.id);

        if(!id){
            res.sendStatus(404);
            return;
        }

        const item: CategoryModel | null = await this.services.categoryService.getById(id);

        if(item == null){
            res.sendStatus(404);
            return;
        }
        res.send(item);
    }

    async add(req: express.Request, res: express.Response, next: express.NextFunction){
        const item = req.body;

        if(!IAddCategorySchemaValidator(item)){
            res.status(400).send(IAddCategorySchemaValidator.errors);
            return;
        }


        const newCategory: CategoryModel|IErrorResponse = await this.services.categoryService.add(item as IAddCategory);

        res.send(newCategory);
    }

    async editById(req: express.Request, res:express.Response, next: express.NextFunction){
        const item = req.body;
        const categoryId = Number(req.params.id);

        if(categoryId <= 0){
            res.status(400).send(["the category ID must be a numerical value larger than 0."]);
            return;
        }

        if(!IEditCategorySchemaValidator(item)){
            res.status(400).send(IEditCategorySchemaValidator.errors);
            return;
        }
        const editedCategory: CategoryModel|IErrorResponse = await this.services.categoryService.edit(categoryId, item as IEditCategory);

        res.send(editedCategory);
    }

    async deleteById(req: express.Request, res: express.Response, next: express.NextFunction){
        const catetgoryId = Number(req.params.id);

        if(catetgoryId <= 0){
            res.status(400).send(["The category ID must be a numerical value larger than 0."]);
            return;
        }
        res.send(await this.services.categoryService.delete(catetgoryId));
    }
}

export default CategoryController;