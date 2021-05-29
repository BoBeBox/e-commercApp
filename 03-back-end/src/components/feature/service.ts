import BaseService from '../../services/BaseServices';
import FeatureModel from './model';
import IModelAdapterOptions from '../../common/IModelAdapterOprtions.Interface';
import CategoryModel from '../category/model';
import { IAddFeature } from './dto/IAddFeature';
import IErrorResponse from '../../common/IErrorResponse.interface';
import { IEditFeature } from './dto/IEditFeature';

class FeatureModelAdapterOptions implements IModelAdapterOptions {
    loadParentCategory: boolean = false;
}

class FeatureService extends BaseService<FeatureModel>{
    async adaptToModel(
        data: any,
        options: Partial<FeatureModelAdapterOptions>,
    ): Promise<FeatureModel> {
        const item: FeatureModel = new FeatureModel();

        item.featureId = Number(data?.feature_id);
        item.name = data?.name;
        item.categoryId = Number(data?.category_id);

        if(options.loadParentCategory && item.categoryId !== null){
            item.category = await this.services.categoryService.getById(item.categoryId);
        } //adapter koji komunicira izmedju categoryService i Feature

        return item;
    }

    public async getById(featureId: number, options: Partial<IModelAdapterOptions> = {loadParent: false, loadChildren: true}): Promise<FeatureModel|null>{
        return super.getByIdFromTable("feature",featureId, options);
    }

    public async getAllByParentCategoryId(categoryId: number): Promise<FeatureModel[]> {
        const firstParent = await this.services.categoryService.getById(categoryId, {
            loadFeatures: false,
            loadParentCategories: false,
            loadSubCategories: false,
        });

        if(!(firstParent instanceof CategoryModel)){
            return []
        }

        const features: FeatureModel[] = [];

        let currentParent: CategoryModel|null = firstParent;

        while (currentParent !== null) {
            features.push(... await super.getByFieldIdFromTable<FeatureModelAdapterOptions>("feature", "category_id", currentParent.categoryId));
            currentParent = await this.services.categoryService.getById(currentParent.parentCategoryId, {
                loadParentCategories: false,
                loadSubCategories: false,
                loadFeatures: false,
            });
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
        });
    }
}
export default FeatureService;