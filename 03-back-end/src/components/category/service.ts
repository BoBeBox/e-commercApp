import CategoryModel from './model';
import { IAddCategory } from './dto/IAddCategory';
import IErrorResponse from '../../common/IErrorResponse.interface';
import BaseService from '../../services/BaseServices';
import IModelAdapterOprtionsInterface from '../../common/IModelAdapterOprtions.Interface';
import { IEditCategory } from './dto/IEditCategory';


class CategoryService extends BaseService<CategoryModel> {
    adaptToModedl(data: any, options: Partial<IModelAdapterOprtionsInterface>): Promise<CategoryModel> {
        throw new Error('Method not implemented.');
    }

    async adaptToModel(
        data: any,
        options: Partial<{ loadParent: boolean, loadChildrean: boolean }> = {
            loadParent : false,
            loadChildrean : false, //OVDE VIDI
        }
    ): Promise<CategoryModel>{
        const item: CategoryModel = new CategoryModel();

        item.categoryId = Number(data?.category_id);
        item.name = data?.name;
        item.imagePath = data?.image_path;
        item.parentCategoryId = Number(data?.parent_category_id);

        if(options.loadParent && item.parentCategoryId){
            item.parentCategory = await this.getById(item.parentCategoryId);
        }
        if(options.loadChildrean ){
            item.subcategories = await this.getByParentCategoryId(item.categoryId);
        }
        return item;
    }

    public async getAll(): Promise<CategoryModel[]>{
        return this.getByFieldIdFromTable("category", "category_id", null);
    }

    public async getByParentCategoryId(parentCategoryId: number): Promise<CategoryModel[]> {
        return this.getByFieldIdFromTable("category", "parent_category_id", parentCategoryId);
    }

    public async getById(categoryId: number): Promise<CategoryModel|null>{
        return super.getByIdFromTable("category", categoryId, { loadParent: false, loadChildren: true, });
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

    public async edit(categoryId: number, data: IEditCategory): Promise<CategoryModel|IErrorResponse>{
        return new Promise<CategoryModel|IErrorResponse>((result) => {
            const sql: string=`
            UPDATE
                categpry
            SET
                name = ?,
                image_path = ?,
                parent_category_id = ?
            WHERE
                category_id = ?;`;
        this.db.execute(sql,[data.name, data.imagePath, data.parentCategoryId ?? null, categoryId])
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
}

export default CategoryService;