import BasePage, { PageProperties } from '../BasePage/BasePage';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CategoryModel from '../../../../03-back-end/src/components/category/model';
class CategoryPageProperties extends PageProperties {
    match?: {
        params: {
            cid: string;
        }
    }
}

class CategoryPageState {
    title: string = "";
    isTopLevelCategory: boolean = true;
    parentCategoryId: number|null = null;
    subcategories: CategoryModel[] = [];
}

export default class CategoryPage extends BasePage<CategoryPageProperties>{
    state: CategoryPageState;

    constructor(props:CategoryPageProperties){
        super(props);

        this.state = {
            title: "Loading...",
            isTopLevelCategory: true,
            parentCategoryId: null,
            subcategories: [],
        };
    }

    private getCategoryIdFromProps(props: CategoryPageProperties): number|null {
        const paramCid = props.match?.params.cid;
        return paramCid ? Number(paramCid) : null;
    }

    private CategoryData(){
        let paramCategoryId = this.getCategoryIdFromProps(this.props);
        let urlCategoryIdPart = paramCategoryId ?? '';

        axios({
            method:'get',
            baseURL:'http://localhost:40080/api',
            url: '/category/'+ urlCategoryIdPart,
            timeout: 10000,
            responseType:'text',
            headers:{
                Autorization: 'Fake-TOKEN',
            },
            withCredentials: true,
            maxRedirects: 0,
        })
        .then(res => {
            if(Array.isArray(res.data)){
                return this.setState({
                    parentCategoryId: null,
                    isTopLevelCategory: true,
                    title:"Categories",
                    subcategories: res.data,
                });
            }
            if(typeof res.data !== "object"){
                throw new Error("Invalid data recieved!");
            }
            this.setState({
                parentCategoryId: res.data.parentCategoryId,
                isTopLevelCategory: false,
                title: res.data.name,
                subcategories: res.data.subcategories,
            });
        })
        .catch(err => {
            if((err + "").includes("404")){
                return this.setState({
                    titel: "Category not found",
                    subcateogires: [],
                })
            }
            this.setState({
                titel:"Unable to load category",
                subcategories: [],
            })
        })
    }

    //poziva se kada se komponenta ugradi u stranicu, kada se prikaze
    componentDidMount(){
        this.CategoryData();
    }
    //poziva se svaki put put kako dodje do promene stanja ili osobine komponente
    componentDidUpdate(prevProps: CategoryPageProperties, prevState: CategoryPageState) {
        let odlCategoryId = this.getCategoryIdFromProps(prevProps);
        let currentCategoryId = this.getCategoryIdFromProps(this.props);

        console.log('updated: ', odlCategoryId, currentCategoryId)

        if(odlCategoryId !== currentCategoryId){
            this.CategoryData();
        }
    }

    renderMain(): JSX.Element {
        let pid = ""+ this.state.parentCategoryId;

        if(pid ==="null"|| pid ==="0") pid = "";
        return (
            <div className="pageHolder">
                <h1>
                    {
                    this.state.isTopLevelCategory === false ?
                    (
                        <Link className = "text-decoration-name" 
                        to={"/category/"+pid}>
                            &laquo; Back |
                        </Link>
                    )
                    : ""
                    }
                </h1>
                    <ul>
                        {
                            this.state.subcategories.map(category =>(
                                <li key={"subcategory-item-link-" + category.categoryId}>
                                    <Link className="nav-link" to={"/category/"+category.categoryId}>
                                        Cagetory {category.name}
                                    </Link>
                                </li>
                            ))
                        }
                    </ul>
            </div>
        )
    }
}