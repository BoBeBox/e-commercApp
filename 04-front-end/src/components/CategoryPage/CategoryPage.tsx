import BasePage, { PageProperties } from '../BasePage/BasePage';
import { Link } from 'react-router-dom';
class CategoryPageProperties extends PageProperties {
    match?: {
        params: {
            cid: string;
        }
    }
}

class CategoryPageState {
    categoryId?: number|null = null;
    title: string = "";
    subcategories: number[] = [];
}

export default class CategoryPage extends BasePage<CategoryPageProperties>{
    state: CategoryPageState = {
        title: "",
        subcategories: [],
    };

    private categoryIdUpdated(){
        const cid = this.props.match?.params.cid;

        this.setState({
            categoryId: cid ? +cid : null,
            title: this.props.match?.params.cid
                ? `Subcategories of category ${this.props.match?.params.cid}`
                : "Top Level Categories",
            subcategories: [],
        });
        this.getDataFromTheApi(this.state.categoryId??null);
    }

    private getDataFromTheApi(parentCategoryId:number|null){
        setTimeout(()=> {
            this.setState({
            subcategories: [
                +(this.state.categoryId ?? 0) + 10,
                +(this.state.categoryId ?? 0) + 12,
                +(this.state.categoryId ?? 0) + 13,
                +(this.state.categoryId ?? 0) + 17,
                +(this.state.categoryId ?? 0) + 56,
            ],
        });
    }, 1000);
    }
    //poziva se kada se komponenta ugradi u stranicu, kada se prikaze
    componentDidMount(){
        this.categoryIdUpdated();
    }
    //poziva se svaki put put kako dodje do promene stanja ili osobine komponente
    componentDidUpdate(){
        const cid = this.props.match?.params.cid ? +(this.props.match?.params.cid):null

        if(this.state.categoryId !==cid){
            this.categoryIdUpdated();
        }
    }

    renderMain(): JSX.Element {
        return (
            <div className="pageHolder">
                <h1>{this.state.title}</h1>
                <p>Za sad neke pod kategorije:</p>
                    <ul>
                        {
                            this.state.subcategories.map(catId =>(
                                <li key={"subcategory-item-link-" + catId}>
                                    <Link className="nav-link" to={"/category/"+catId}>
                                        Cagetory {catId}
                                    </Link>
                                </li>
                            ))
                        }
                    </ul>
            </div>
        )
    }
}