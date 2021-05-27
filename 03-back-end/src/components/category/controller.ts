import CategoryService from './service';
import * as express from 'express';
import CategoryModel from './model';
import { IAddCategory, IAddCategorySchemaValidator } from './dto/IAddCategory';
import IErrorResponse from '../../common/IErrorResponse.interface';
import { IEditCategory, IEditCategorySchemaValidator } from './dto/IEditCategory';
class CategoryController {
    private categoryService: CategoryService;

    constructor(categoryService: CategoryService){
        this.categoryService = categoryService;
    }

    async getAll (req: express.Request, res: express.Response, next: express.NextFunction){
        res.send(await this.categoryService.getAll());
    }

    async getById (req: express.Request, res: express.Response, next: express.NextFunction){
        const id: number = Number(req.params?.id);

        if(!id){
            res.sendStatus(404);
            return;
        }

        const item: CategoryModel | null = await this.categoryService.getById(id);

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

        const data: IAddCategory = item;

        const newCategory: CategoryModel|IErrorResponse = await this.categoryService.add(data);

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
        const editedCategory: CategoryModel|IErrorResponse = await this.categoryService.edit(categoryId, item as IEditCategory);
    }
}

export default CategoryController;