import BasePage, { PageProperties } from '../BasePage/BasePage';
import { Link } from 'react-router-dom';
import CategoryModel from '../../../../03-back-end/src/components/category/model';
import api from '../../api/api';
import CategoryService from '../../services/CategoryService';
import ArticleModel from '../../../../03-back-end/src/components/article/model';
import ArticleService from '../../services/ArticleService';
import * as path from 'path';
import { CardDeck, Col, Card, Row } from 'react-bootstrap';
import { ApiConfig } from '../../config/api.config';
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

    private getThumbPath(url: string): string {
        const directory = path.dirname(url);
        const extPart = path.extname(url);
        const namePart = path.basename(url, extPart);
        return directory + "/" + namePart + "-thumb" + extPart;
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
                        <CardDeck className="row">
                            {
                                this.state.articles.map(
                                    article => (
                                        <Col key={"article-cart-holder-" + article.articleId} xs={12} md={4} lg={3} className="mb-3">
                                            <Card key={"article-cart-" + article.articleId}>
                                                <Link to={"/article/" + article.articleId}>
                                                    <Card.Img variant="top" src={ApiConfig.APP_ROOT + this.getThumbPath(article.photos[0]?.imagePath)}/>
                                                </Link>
                                                <Card.Body>
                                                    <Card.Title>
                                                        <Link to={"/article/" + article.articleId}>
                                                            {article.name}
                                                        </Link>
                                                    </Card.Title>
                                                    <Card.Text as="div">
                                                        {article.excerpt}
                                                    </Card.Text>
                                                    <Card.Text as="div">
                                                        <Row>
                                                            <Col md={12} lg={5} xl={4}>
                                                                <b>Price</b><br />
                                                                &euro;{article.currentPrice}
                                                            </Col>
                                                            <Col md={12} lg={7} xl={8}>
                                                                <b>Feature</b><br />
                                                                {
                                                                    article.features.map(
                                                                        af=>af.feature.name + ": " + af.value
                                                                    ).join(", ")
                                                                }
                                                            </Col>
                                                        </Row>
                                                    </Card.Text>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    )
                                )
                            }

                        </CardDeck> 
                        
                    ) : ""
                }
            </>
        );
    }
}