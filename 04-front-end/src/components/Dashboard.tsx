import { isRoleLoggedInAs } from '../api/api';
import EventRegister from '../api/EventRegister';
import BasePage from './BasePage/BasePage';
import { Link } from 'react-router-dom';
export default class Dashboard extends BasePage<{}>{
    componentDidMount() {
        isRoleLoggedInAs("administrator")
        .then(result => {
            if (result === false) {
                EventRegister.emit("AUTH_EVENT", "administrator.logout");
            }
        });
    }
    renderMain(): JSX.Element {
        return (
            <div className="pageHolder">
                <h1>Administrator dashboard</h1>
                <ul>
                    <li><Link to="/dashboard/category">Category Management</Link></li>
                    <li><Link to="/dashboard/article">Article Management</Link></li>
                    <li><Link to="/dashboard/user">User Management</Link></li>
                    <li><Link to="/dashboard/order">Order Management</Link></li>
                    <li><Link to="/dashboard/administrator">Administrator Management</Link></li>
                </ul>
            </div>
        )
    }
}