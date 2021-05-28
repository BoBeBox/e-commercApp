import BaseService from '../../services/BaseServices';
import FeatureModel from './model';
import * as mysql2 from 'mysql2/promise';
import CategoryService from '../category/service';
import IModelAdapterOptions from '../../common/IModelAdapterOprtions.Interface';
import CategoryModel from '../category/model';
import { IAddFeature } from './dto/IAddFeature';
import IErrorResponse from '../../common/IErrorResponse.interface';
import { IEditFeature } from './dto/IEditFeature';
class FeatureService extends BaseService<FeatureModel>{
    private categoryService: CategoryService

    constructor(database: mysql2.Connection){
        super (database);
        this.categoryService = new CategoryService(this.db);
    }

    async adaptToModel(
        data: any,
        options: Partial<{ loadParent: boolean, loadChildren: boolean }> = {
            loadParent: false,
            loadChildren: false
        }
    ): Promise<FeatureModel> {
        const item: FeatureModel = new FeatureModel();

        item.featureId = Number(data?.featureId);
        item.name = data?.name;
        item.categoryId = Number(data?.categoryId);

        if(options.loadParent && item.categoryId !== null){
            item.category = await this.categoryService.getById(item.categoryId);
        } //adapter koji komunicira izmedju categoryService i Feature
        return item;
    }

    public async getById(featureId: number, options: Partial<IModelAdapterOptions> = {loadParent: false, loadChildren: true}): Promise<FeatureModel|null>{
        return super.getByIdFromTable("feature",featureId, options);
    }

    public async getAllByParentCategoryId(categoryId: number): Promise<FeatureModel[]>{
        const firstParent = await this.categoryService.getById(categoryId);

        if(!(firstParent instanceof CategoryModel)){
            return []
        }

        const features: FeatureModel[] = [];

        let currentParent: CategoryModel|null = firstParent;

        while(currentParent !== null){
            features.push(... await super.getByFieldIdFromTable("feature", "category_id", currentParent.categoryId, {loadParent: false, loadChildren: false}));
            currentParent = await this.categoryService.getById(currentParent.parentCategoryId);
        }
        return features;
    }

    public async add(data: IAddFeature): Promise<FeatureModel|IErrorResponse>{
        return new Promise<FeatureModel|IErrorResponse>((result)=>{
            const sql: string = "INSERT feature SET name = ?, category_id = ?;";

            this.db.execute(sql, [data.name, data.categoryId])
                .then(async res => {
                    const resultData: any = res;
                    const newId: number =  Number(resultData[0]?.insertId);
                    result(await this.getById(newId, {loadParent: true}));
                })
                .catch(err =>{
                    result({
                        errorCode: err?.errno,
                        message: err?.sqlMessage,
                    });
                    
                });
        });
    }

    public async edit(id: number, data: IEditFeature): Promise<FeatureModel|IErrorResponse>{
        return new Promise<FeatureModel|IErrorResponse>((result)=>{
            const sql: string = `
                UPDATE
                    feature
                SET
                    name = ?,
                    category_id = ?
                WHERE
                    feature_id = ?;`;
            this.db.execute(sql, [data.name, data.categoryId, id])
                .then(async res => {
                    result(await this.getById(id, {loadParent: true }));
                })
                .catch(err =>{
                    result({
                        errorCode: err?.errno,
                        message: err?.sqlMessage,
                    });
                });
        });
    }
    public async delete (id: number): Promise<IErrorResponse>{
        return new Promise<IErrorResponse>((result)=>{
            const sql: string = `DELETE FROM feature WHERE feature_id = ?;`;

            this.db.execute(sql, [id])
            .then(async res => {
                const data: any = res;
                result({
                    errorCode: 0,
                    message: `Deleted ${data[0].affectedRows} rows`
                });
            })
            .catch(err => {
                result({
                    errorCode:err?.errno,
                    message: err?.sqlMessage,
                });
            });
        })
    }
}
export default FeatureService;