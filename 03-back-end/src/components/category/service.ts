import CategoryModel from './model';
import * as mysql2 from 'mysql2/promise';
import { IAddCategory } from './dto/IAddCategory';


class CategoryService {

    private db: mysql2.Connection;

    constructor(db: mysql2.Connection){
        this.db = db;
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
        const categories: CategoryModel[] = [];

        const sql: string = "SELECT  * FROM category WHERE parent_category_id IS NULL ORDER BY name;";
        const [rows, fields] = await this.db.execute(sql);

        if(Array.isArray(rows)){
            for(const row of rows){
                categories.push(
                    await this.adaptToModel(
                        row,{
                            loadChildrean: true,
                        }
                    )
                );
            }
        }

        return categories;

    }

    public async getByParentCategoryId(parentCategoryId: number): Promise<CategoryModel[]> {
        const categories: CategoryModel[] = [];

        const sql: string = "SELECT  * FROM category WHERE parent_category_id = ? ORDER BY name;";
        const [rows, fields] = await this.db.execute(sql, [parentCategoryId]);

        if(Array.isArray(rows)){
            for(const row of rows){
                categories.push(
                    await this.adaptToModel(
                        row,{
                            loadChildrean: true,
                        }
                    )
                );
            }
        }

        return categories;
    }

    public async getById(categoryId: number): Promise<CategoryModel|null>{
        const sql: string = "SELECT * FROM category WHERE category_id = ?;";
        const [rows, fields] = await this.db.execute(sql, [categoryId]);

        if(!Array.isArray(rows)){
            return null;
        }

        if(rows.length == 0){
            return null;
        }

        return await this.adaptToModel(
            rows[0],
            {
                loadChildrean: true,
                loadParent: true,
            }
        );
    }

    public async add(data: IAddCategory): Promise<CategoryModel|null>{
        return new Promise<CategoryModel|null>((result)=>{
            const sql: string = "INSERT category SET name = ?, image_path = ?, parent_category_id = ?;";

            this.db.execute(sql, [data.name, data.imagePath, data.parentCategoryId ?? null])
                .then(async res => {
                    const resultData: any = res;
                    const newCategoryId: number = Number(resultData[0]?.insertId);
                    result(await this.getById(newCategoryId));
                })
                .catch(err => {
                    console.error(err?.sqlMessage); 
                    result(null);
                })
        })
    }
}

export default CategoryService;