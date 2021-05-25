import CategoryService from './service';
import * as express from 'express';
import CategoryModel from './model';
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
}

export default CategoryController;