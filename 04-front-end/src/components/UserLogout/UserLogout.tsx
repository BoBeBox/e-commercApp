import { saveRefreshToken, saveToken } from '../../api/api';
import EventRegister from '../../api/EventRegister';
import BasePage from '../BasePage/BasePage';
import { PageProperties } from '../BasePage/BasePage';
import { Redirect } from "react-router";
class UserLogoutState {
    logoutDone: boolean = false;
}

export default class UserLogout extends BasePage<PageProperties> {
    state: UserLogoutState;

    public constructor(props: PageProperties) {
        super(props);

        this.state = {
            logoutDone: false,
        };
    }
    componentDidMount() {
        saveToken("user", "");
        saveRefreshToken("user", "");

        this.setState({
            logoutDone: true,
        });

        EventRegister.emit("AUTH_EVENT", "user.logout");
    }
    renderMain(): JSX.Element {
        if (this.state.logoutDone) {
            return (
                <Redirect to="/user/login" />
            );
        }

        return (
            <div className="pageHolder">
                Logging out...
            </div>
        );
    }
}