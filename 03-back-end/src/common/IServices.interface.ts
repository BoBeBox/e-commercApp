import CategoryService from '../components/category/service';
import FeatureService from '../components/feature/service';
//za sprecavanje cirkularne zavisnosti
export default interface IServices {
    categoryService: CategoryService;
    featureService: FeatureService; 
}