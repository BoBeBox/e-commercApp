import { Button, Form } from "react-bootstrap";
import CategoryModel from "../../../../../../03-back-end/src/components/category/model";
import { isRoleLoggedInAs } from "../../../../api/api";
import EventRegister from "../../../../api/EventRegister";
import CategoryService from "../../../../services/CategoryService";
import FeatureService from "../../../../services/FeatureService";
import BasePage, { PageProperties } from "../../../BasePage/BasePage";

class FeatureDashboardListProperties extends PageProperties {
    match?: {
        params: {
            cid: string;
        }
    }
}
interface FeatureDashboardListState {
    category: CategoryModel | null;
    featureMessages: Map<number, string>;
}

export default class FeatureDashboardList extends BasePage<FeatureDashboardListProperties> {
    state: FeatureDashboardListState;

    constructor(props: FeatureDashboardListProperties) {
        super(props);

        this.state = {
            category: null,
            featureMessages: new Map(),
        };
    }
    componentDidMount() {
        isRoleLoggedInAs("administrator")
        .then(result => {
            if (result === false) return EventRegister.emit("AUTH_EVENT", "administrator.logout");
            this.loadRequestedCategory();
        });
    }
    componentDidUpdate(oldProps: FeatureDashboardListProperties) {
        if (oldProps.match?.params.cid !== this.props.match?.params.cid) {
            this.loadRequestedCategory();
        }
    }

    private loadRequestedCategory() {
        CategoryService.getCategoryById(Number(this.props.match?.params.cid), "administrator")
        .then(category => this.setState({ category: category }));
    }
    private getCurrentFeatureNameFromState(featureId: number): string {
        if (this.state.category?.features === undefined) {
            return "";
        }

        for (let i=0; i<this.state.category?.features.length; i++) {
            if (this.state.category?.features[i].featureId === featureId) {
                return this.state.category.features[i].name;
            }
        }

        return "";
    }

    private updateFeature(featureId: number) {
        const name = this.getCurrentFeatureNameFromState(featureId);

        FeatureService.editFeature(featureId, name)
        .then(res => {
            const message = (res === null) ? "Could not save changes." : "Saved.";

            this.setState((state: FeatureDashboardListState) => {
                state.featureMessages.set(featureId, message);
                return state;
            });

            setTimeout(() => {
                this.setState((state: FeatureDashboardListState) => {
                    state.featureMessages.set(featureId, "");
                    return state;
                });
            }, 2000);
        });
    }

    private deleteFeature(featureId: number) {
        FeatureService.deleteFeature(featureId)
        .then(res => {
            const message = res ? "Deleted." : "Could not delete this feature.";

            this.setState((state: FeatureDashboardListState) => {
                state.featureMessages.set(featureId, message);
                return state;
            });

            setTimeout(() => {
                this.setState((state: FeatureDashboardListState) => {
                    state.featureMessages.set(featureId, "");
                    this.loadRequestedCategory();
                    return state;
                });
            }, 2000);
        });
    }

    onChangeFeatureName(featureId: number): (event: React.ChangeEvent<HTMLInputElement>) => void {
        return (event: React.ChangeEvent<HTMLInputElement>) => {
            const newName = event.target.value;
            this.setState((state: FeatureDashboardListState) => {
                if (state.category?.features === undefined) {
                    return state;
                }

                for (let i=0; i<state.category?.features.length; i++) {
                    if (state.category?.features[i].featureId === featureId) {
                        state.category.features[i].name = newName;
                        return state;
                    }
                }

                return state;
            });
        };
    }

    renderMain(): JSX.Element {
        if (this.state.category === null) {
            return (
                <p>Loading...</p>
            );
        }

        return (
            <>
                <h1>{ this.state.category.name } Features</h1>
                <table className="table table-sm">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Status</th>
                            <th>Options</th>
                        </tr>
                    </thead>
                    <tbody>
                    { this.state.category.features.map(f => (
                        <tr key={ "feature-" + f.featureId }>
                            <td>
                                <Form.Control type="text" value={ f.name } onChange={ this.onChangeFeatureName(f.featureId) } />
                            </td>
                            <td width="400">
                                { this.state.featureMessages.get(f.featureId) }
                            </td>
                            <td width="120">
                                <Button variant="secondary" size="sm"
                                        onClick={ () => this.updateFeature(f.featureId) }>
                                    Save
                                </Button>

                                &nbsp;

                                <Button variant="danger" size="sm"
                                        onClick={ () => this.deleteFeature(f.featureId) }>
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    )) }
                    </tbody>
                </table>
            </>
        );
    }
}
