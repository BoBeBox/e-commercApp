import { saveRefreshToken, saveToken } from '../../api/api';
import EventRegister from '../../api/EventRegister';
import BasePage from '../BasePage/BasePage';
import { PageProperties } from '../BasePage/BasePage';
import { Redirect } from "react-router";
class AdministratorLogoutState {
    logoutDone: boolean = false;
}

export default class AdministratorLogout extends BasePage<PageProperties> {
    state: AdministratorLogoutState;

    public constructor(props: PageProperties) {
        super(props);

        this.state = {
            logoutDone: false,
        };
    }
    componentDidMount() {
        saveToken("administrator", "");
        saveRefreshToken("administrator", "");

        this.setState({
            logoutDone: true,
        });

        EventRegister.emit("AUTH_EVENT", "administrator.logout");
    }
    renderMain(): JSX.Element {
        if (this.state.logoutDone) {
            return (
                <Redirect to="/administrator/login" />
            );
        }

        return (
            <div className="pageHolder">
                Logging out...
            </div>
        );
    }
}