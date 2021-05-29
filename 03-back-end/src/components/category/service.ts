import CategoryModel from './model';
import { IAddCategory } from './dto/IAddCategory';
import IErrorResponse from '../../common/IErrorResponse.interface';
import BaseService from '../../services/BaseServices';
import { IEditCategory } from './dto/IEditCategory';
import IModelAdapterOptions from '../../common/IModelAdapterOprtions.Interface';

class CategoryModelAdapterOptions implements IModelAdapterOptions{
    loadParentCategories: boolean = false;
    loadSubCategories: boolean = false;
    loadFeatures: boolean = false;
}
class CategoryService extends BaseService<CategoryModel> {

    async adaptToModel(
        data: any,
        options: Partial<CategoryModelAdapterOptions>,
    ): Promise<CategoryModel>{
        const item: CategoryModel = new CategoryModel();

        item.categoryId = Number(data?.category_id);
        item.name = data?.name;
        item.imagePath = data?.image_path;
        item.parentCategoryId = Number(data?.parent_category_id);

        if(options.loadParentCategories && item.parentCategoryId){
            item.parentCategory = await this.getById(item.parentCategoryId);
        }
        if(options.loadSubCategories){
            item.subcategories = await this.getByParentCategoryId(item.categoryId);
        }

        if(options.loadFeatures){
            item.features = await this.services.featureService.getAllByParentCategoryId(item.categoryId)
        }

        return item;
    }

    public async getAll(): Promise<CategoryModel[]>{
        return super.getByFieldIdFromTable<CategoryModelAdapterOptions>("category", "parent_category_id", null,{
            loadSubCategories: true,
            loadFeatures: true,
        });
    }

    public async getByParentCategoryId(parentCategoryId: number): Promise<CategoryModel[]> {
        return super.getByFieldIdFromTable<CategoryModelAdapterOptions>("category", "parent_category_id", parentCategoryId,{
            loadSubCategories: true,
            loadFeatures: true,
        });
    }

    public async getById(categoryId: number, options: Partial<CategoryModelAdapterOptions> = {
        loadSubCategories: true,
        loadFeatures: true,
    }): Promise<CategoryModel|null> {
        return super.getByIdFromTable<CategoryModelAdapterOptions>("category", categoryId, options);//tabela category
    }

    public async add(data: IAddCategory): Promise<CategoryModel|IErrorResponse>{
        return new Promise<CategoryModel|IErrorResponse>((result)=>{
            const sql: string = "INSERT category SET name = ?, image_path = ?, parent_category_id = ?;";

            this.db.execute(sql, [data.name, data.imagePath, data.parentCategoryId ?? null])
                .then(async res => {
                    const resultData: any = res;
                    const newCategoryId: number = Number(resultData[0]?.insertId);
                    result(await this.getById(newCategoryId));
                })
                .catch(err => {
                    result({
                        errorCode: err?.error,
                        message: err?.sqlMessage,
                    });
                })
        })
    }

    public async edit(categoryId: number, data: IEditCategory): Promise<CategoryModel|IErrorResponse> {
        return new Promise<CategoryModel|IErrorResponse>((result) => {
            const sql: string = `
                UPDATE
                    category
                SET
                    name = ?,
                    image_path = ?,
                    parent_category_id = ?
                WHERE
                    category_id = ?;`;

            this.db.execute(sql, [data.name, data.imagePath, data.parentCategoryId ?? null, categoryId])
                .then(async res => {
                    result(await this.getById(categoryId));
                })
                .catch(err => {
                    result({
                        errorCode: err?.errno,
                        message: err?.sqlMessage,
                    });
                });
        });
    }

    public async delete (categoryId: number): Promise<IErrorResponse>{
        return new Promise<IErrorResponse>((result)=>{
            const sql: string = `DELETE FROM category WHERE category_id = ?;`;

            this.db.execute(sql, [categoryId])
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

export default CategoryService;