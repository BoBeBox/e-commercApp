import CategoryService from '../components/category/service';
import FeatureService from '../components/feature/service';
import ArticleService from '../components/article/service';
import AdministratorService from '../components/aministrator/service';
import UserService from '../components/user/service';
import CartService from '../components/cart/service';
//za sprecavanje cirkularne zavisnosti
export default interface IServices {
    categoryService: CategoryService;
    featureService: FeatureService;
    articleService: ArticleService;
    administratorService: AdministratorService;
    userService: UserService;
    cartService: CartService;
}