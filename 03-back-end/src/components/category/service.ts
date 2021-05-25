import CategoryModel from './model';


class CategoryService {
    public async getAll(): Promise<CategoryModel[]>{
        const categories: CategoryModel[] = [];

        categories.push({
            categoryId: 1,
            name: "Fake Demo Categody A",
            imagePath: "static/category/1.png",
            parentCategoryId: null,
            parentCategory: null
        });
        categories.push({
            categoryId: 2,
            name: "Fake Demo Categody B",
            imagePath: "static/category/2.png",
            parentCategoryId: null,
            parentCategory: null
        });
        categories.push({
            categoryId: 3,
            name: "Fake Demo Categody C",
            imagePath: "static/category/3.png",
            parentCategoryId: null,
            parentCategory: null
        });
        return categories;

    }

    public async getById(categoryId: number): Promise<CategoryModel|null>{
        if(![1, 2, 3].includes(categoryId)){
            return null;
        }
        return {
            categoryId: categoryId,
            name: "Fake Deno Category " + (categoryId == 1) ? "A" : "B",
            imagePath: `static/category/${categoryId}.png`,
            parentCategoryId: null,
            parentCategory: null
        };
    }
}

export default CategoryService;