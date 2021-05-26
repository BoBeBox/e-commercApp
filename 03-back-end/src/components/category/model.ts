import * as mysql2 from "mysql2/promise";
class CategoryModel {
    categoryId: number;
    name: string;
    imagePath: string;
    parentCategoryId: number | null = null;
    parentCategory: CategoryModel | null = null;
    subcategories: CategoryModel [] = [];
}

export default CategoryModel;