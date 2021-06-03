import BasePage, { PageProperties } from '../BasePage/BasePage';
import { Link } from 'react-router-dom';
import CategoryModel from '../../../../03-back-end/src/components/category/model';
import api from '../../api/api';
import CategoryService from '../../services/CategoryService';
import ArticleModel from '../../../../03-back-end/src/components/article/model';
import ArticleService from '../../services/ArticleService';
class CategoryPageProperties extends PageProperties {
    match?: {
        params: {
            cid: string;
        }
    }
}

class CategoryPageState {
    title: string = "";
    subcategories: CategoryModel[] = [];
    showBackButton: boolean = false;
    parentCategoryId: number|null = null;
    articles: ArticleModel[] = [];
}

export default class CategoryPage extends BasePage<CategoryPageProperties>{
    state: CategoryPageState;

    constructor(props:CategoryPageProperties){
        super(props);

        this.state = {
            title: "Loading...",
            subcategories: [],
            showBackButton: false,
            parentCategoryId: null,
            articles: [],
        };
    }

    private getCategoryId(): number|null {
        const cid = this.props.match?.params.cid;
        return cid ? +(cid) : null;
    }

    private getCategoryData(){
        const cId = this.getCategoryId();
        
        if (cId === null) {
            this.apiGetTopLevelCategories();
        } else {
            this.apiGetCategory(cId);
        }
    }

    private apiGetTopLevelCategories() {
        CategoryService.getTopLevelCategories()
        .then(categories => {
            if (categories.length === 0) {
                return this.setState({
                    title: "No categories found",
                    subcategories: [],
                    showBackButton: true,
                    parentCategoryId: null,
                    artocles: [],
                });
            }
            this.setState({
                title: "All categories",
                subcategories: categories,
                showBackButton: false,
                parentCategoryId: null,
                articles: [],
            });
        })
    }

    private apiGetCategory(cId: number) {
        CategoryService.getCategoryById(cId)
        .then(result => {
            if (result === null) {
                return this.setState({
                    title: "Category not found",
                    subcategories: [],
                    showBackButton: true,
                    parentCategoryId: null,
                });
            }

            this.setState({
                title: result.name,
                subcategories: result.subcategories,
                parentCategoryId: result.parentCategoryId,
                showBackButton: true,
            });
            this.apiGetArticlesByCategoryId(cId);
        });
    }
    private apiGetArticlesByCategoryId(cId: number){
        ArticleService.getArticlesByCategoryId(cId)
        .then(res => {
            if(!Array.isArray(res)) {
                return this.setState({
                    articles: [],
                });
            }
            this.setState({
                articles: res as ArticleModel[],
            })
        })
    }

    //poziva se kada se komponenta ugradi u stranicu, kada se prikaze
    componentDidMount(){
        this.getCategoryData();
    }
    //poziva se svaki put put kako dodje do promene stanja ili osobine komponente
    componentDidUpdate(prevProps: CategoryPageProperties, prevState: CategoryPageState) {
        if (prevProps.match?.params.cid !== this.props.match?.params.cid) {
            this.getCategoryData();
        }
    }

    renderMain(): JSX.Element {

        return (
            <>
                <h1>
                    {
                        this.state.showBackButton
                        ? (
                            <>
                                <Link to={ "/category/" + (this.state.parentCategoryId ?? '') }>
                                    &lt; Back
                                </Link>
                                |
                            </>
                        )
                        : ""
                    }
                    { this.state.title }
                </h1>

                {
                    this.state.subcategories.length > 0
                    ? (
                        <>
                            <p>Podkategorije:</p>
                            <ul>
                                {
                                    this.state.subcategories.map(
                                        catategory => (
                                            <li key={ "subcategory-link-" + catategory.categoryId }>
                                                <Link to={ "/category/" + catategory.categoryId }>
                                                    { catategory.name }
                                                </Link>
                                            </li>
                                        )
                                    )
                                }
                            </ul>
                        </>
                    )
                    : ""
                }
                {
                    this.state.articles.length>0
                    ? (
                        <>
                            <ul>
                                {
                                    this.state.articles.map(
                                        article => (
                                            <li key={"article-link" + article.articleId}>
                                                <Link to={"/article/"+article.articleId}>
                                                    {article.name}
                                                </Link>
                                            </li>
                                        )
                                    )
                                }
                            </ul>
                        </>
                    ) : ""
                }
            </>
        );
    }
}