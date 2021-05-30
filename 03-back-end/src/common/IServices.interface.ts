import CategoryService from '../components/category/service';
import FeatureService from '../components/feature/service';
import ArticleService from '../components/article/service';
//za sprecavanje cirkularne zavisnosti
export default interface IServices {
    categoryService: CategoryService;
    featureService: FeatureService;
    articleService: ArticleService;
}