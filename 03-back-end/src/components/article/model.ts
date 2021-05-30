import IModel from '../../common/IModel.interface';
import CategoryModel from '../category/model';
import { IArticleFeatureValue } from './dto/IAddArticle';
class Price implements IModel{
    priceId: number;
    price: number;
    createdAt: Date;
}

class Photo implements IModel{
    photoId: number;
    imagePath: string;
}

class ArticleModel implements IModel {
    articleId: number;
    createdAt:Date;
    name: string;
    excerpt: string;
    description: string;
    status: 'available'|'visible'|'hidden';
    isPromoted: boolean;
    categoryId: number;
    category?:CategoryModel;
    features: IArticleFeatureValue[] = [];
    currentPrice: number;
    prices: Price[] = [];
    photos: Photo[] = []; 
}

export {Price as ArticlePrice};
export {Photo as ArticlePhoto};
export default ArticleModel;