import CategoryModel from "../../../../../../03-back-end/src/components/category/model";
import api, { isRoleLoggedInAs } from "../../../../api/api";
import EventRegister from "../../../../api/EventRegister";
import CategoryService from "../../../../services/CategoryService";
import BasePage from "../../../BasePage/BasePage";
import {Fragment} from "react";
import { Button, Card, Row, Col, Form } from "react-bootstrap";
import { Redirect } from "react-router";

interface CategoryDashboardAddState {
    categories: CategoryModel[];
    name: string;
    imagePath: string;
    parentCategoryId: string;
    message: string,
    redirectBackToCategories: boolean,
}

export default class CategoryDashboardAdd extends BasePage<{}> {
    state: CategoryDashboardAddState;

    constructor(props: any) {
        super(props);

        this.state = {
            categories: [],
            name: "",
            imagePath: "",
            parentCategoryId: "",
            message: "",
            redirectBackToCategories: false,
        }
    }

    onChangeInput(field: "name" | "imagePath"): (event: React.ChangeEvent<HTMLInputElement>) => void {
        return (event: React.ChangeEvent<HTMLInputElement>) => {
            this.setState({
                [field]: event.target.value,
            });
        };
    }

    onChangeSelect(field: "parentCategoryId"): (event: React.ChangeEvent<HTMLSelectElement>) => void {
        return (event: React.ChangeEvent<HTMLSelectElement>) => {
            this.setState({
                [field]: event.target?.value + "",
            });
        };
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
        if (this.state.redirectBackToCategories) {
            return (
                <Redirect to="/dashboard/category" />
            );
        }

        return (
            <div className="pageHolder">
                <Row>
                    <Col xs={12} md={{ span: 8, offset: 1 }} lg={{ span: 6, offset: 3 }}>
                        <Card>
                            <Card.Body>
                                <Card.Title><b>Add new category</b></Card.Title>
                                <Card.Text as="div">
                                    <Form.Group>
                                        <Form.Label>Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter the name of the new category"
                                            value={ this.state.name }
                                            onChange={ this.onChangeInput("name") }
                                        />
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.Label>Image path</Form.Label>
                                        <Form.Control
                                            type="url"
                                            placeholder="Enter the full path for a generic image for this new category"
                                            value={ this.state.imagePath }
                                            onChange={ this.onChangeInput("imagePath") }
                                        />
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.Label>Parent category</Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={ this.state.parentCategoryId }
                                            onChange={ this.onChangeSelect("parentCategoryId") }>
                                            <option value=""></option>

                                            { this.state.categories.map(category => this.createSelectOptionGroup(category)) }
                                        </Form.Control>
                                    </Form.Group>

                                    <Form.Group>
                                        <Button
                                            variant="primary"
                                            className="mt-3"
                                            onClick={ () => this.attemptToAdd() }>
                                            Add
                                        </Button>
                                    </Form.Group>

                                    {
                                        this.state.message !== ""
                                        ? ( <p className="mt-3">{ this.state.message }</p> )
                                        : ""
                                    }
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }

    private createSelectOptionGroup(category: CategoryModel, level: number = 0): JSX.Element {
        const levelPrefix = "◦ ".repeat(level);
        return (
            <Fragment key={"category-subcategory-gragment-" + category.categoryId}>
                <option key={ "category-select-item-" + category.categoryId } value={ category.categoryId + "" }>
                    { levelPrefix + category.name }
                </option>

                { category.subcategories.map(subcategory => this.createSelectOptionGroup(subcategory, level + 1)) }
            </Fragment>
        );
    }

    private attemptToAdd() {
        const data = {
            name: this.state.name,
            imagePath: this.state.imagePath,
            parentCategoryId: this.state.parentCategoryId !== "" ? Number(this.state.parentCategoryId) : null,
        };

        api("post", "/category", "administrator", data)
        .then(res => {
            if (res?.status === 'error') {
                if (Array.isArray(res?.data?.response?.data)) {
                    const item = res?.data?.response?.data[0]?.dataPath.replace(".", "") + "";
                    const message = res?.data?.response?.data[0]?.message;

                    const error = (item + " " + message).trim();

                    return this.setState({
                        message: error ? error : "Could not create a new category."
                    });
                }

                return this.setState({
                    message: res?.data?.response?.data?.message ?? "Could not create a new category."
                });
            }

            if (res?.data?.errorCode === 1062) {
                return this.setState({
                    message: "A category with this name or image path already exists."
                });
            }

            this.setState({
                redirectBackToCategories: true,
            });
        })
        .catch(err => {
            this.setState({
                message: "Error: " + err?.message,
            });
        });
    }
}
