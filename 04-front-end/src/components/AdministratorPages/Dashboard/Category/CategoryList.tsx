import { ButtonGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import CategoryModel from "../../../../../../03-back-end/src/components/category/model";
import { isRoleLoggedInAs } from "../../../../api/api";
import EventRegister from "../../../../api/EventRegister";
import CategoryService from "../../../../services/CategoryService";
import BasePage from "../../../BasePage/BasePage";

interface CategoryDashboardListState {
    categories: CategoryModel[];
}

export default class CategoryDashboardList extends BasePage<{}> {
    state: CategoryDashboardListState;

    constructor(props: any) {
        super(props);

        this.state = {
            categories: [],
        }
    }

    componentDidMount() {
        isRoleLoggedInAs("administrator")
        .then(result => {
            if (result === false) {
                EventRegister.emit("AUTH_EVENT", "administrator.logout");
            }

            this.loadCategories();
        });
    }

    private loadCategories() {
        CategoryService.getTopLevelCategories("administrator")
        .then(categories => {
            this.setState({
                categories: categories,
            });
        });
    }

    renderMain(): JSX.Element {
        return (
            <div className="pageHolder">
                <h1>All categories</h1>
                <div>
                    <Link className="btn btn-link" to="/dashboard/category/add/">
                        Add new category
                    </Link>
                </div>
                { this.renderCategoryGroup(this.state.categories) }
            </div>
        );
    }

    private renderCategoryGroup(categories: CategoryModel[]): JSX.Element {
        return (
            <ul>
                {
                    categories.map(category => (
                        <li key={ "category-item-" + category.categoryId }>
                            <b>{ category.name }</b>
                            &nbsp;
                            <ButtonGroup size="sm">
                                <Link className="btn btn-link" to={ "/dashboard/category/edit/" + category.categoryId }>
                                    Edit
                                </Link>
                                <Link className="btn btn-link" to={ "/dashboard/category/feature/" + category.categoryId }>
                                    Features
                                </Link>
                            </ButtonGroup>
                            { this.renderCategoryGroup(category.subcategories) }
                        </li>
                    ))
                }
            </ul>
        );
    }
}
