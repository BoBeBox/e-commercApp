import { Suspense } from "react";
import { Container, } from "react-bootstrap";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import TopMenu from "../TopMenu/TopMenu";
import ContactPage from "../ContactPage/ContactPage";
import HomePage from "../HomePage/HomePage";
import CategoryPage from '../CategoryPage/CategoryPage';
import UserLogin from '../UserPages/UserLogin';
import UserLogout from '../UserPages/UserLogout';
import React from 'react';
import api from "../../api/api";
import EventRegister from "../../api/EventRegister";
import ArticlePage from '../Article/ArticlePage';
import UserRegistration from '../UserPages/UserRegistration';
import AdministratorLogin from '../AdministratorPages/AdministratorLogin';
import AdministratorLogout from '../AdministratorPages/AdministratorLogout';
import CategoryDashboardList from '../AdministratorPages/Dashboard/Category/CategoryList';
import CategoryDashboardAdd from '../AdministratorPages/Dashboard/Category/CategoryAdd';
import CategoryDashboardEdit from '../AdministratorPages/Dashboard/Category/CategoryEdit';
import FeatureDashboardList from "../AdministratorPages/Dashboard/Feature/FeatureList";
import CartPage from "../Cart/CartPage";

class ApplicationState {
    authorizedRole: "user" | "administrator" | "visitor";
}

export default class Application extends React.Component{
    state: ApplicationState;

    constructor(props: any) {
        super(props);

        this.state = {
            authorizedRole: "visitor",
        }
    }

    private checkRole(role: "user" | "administrator") {
        api("get", "/auth/" + role + "/ok", role)
            .then(res => {
                if (res?.data === "OK") {
                    this.setState({
                        authorizedRole: role,
                    });
                }
            })
            .catch(() => { });
    }

    componentDidMount() {
        this.checkRole("user");
        this.checkRole("administrator");

        EventRegister.on("AUTH_EVENT", this.loginLogoutEventHandler.bind(this));
    }

    private loginLogoutEventHandler(e: any) {
        if (e === "user.login" || e === "user.logout") {
            this.checkRole("user");
        }

        if (e === "administrator.login" || e === "administrator.logout") {
            this.checkRole("administrator");
        }
    }

    componentWillUnmount() {
        EventRegister.off("AUTH_EVENT", this.loginLogoutEventHandler.bind(this));
    }
    render(){
        return (
            <BrowserRouter>
                <Container fluid>
                    <TopMenu authorizedRole={this.state.authorizedRole}/>

                    <div className="Application">
                        <header className="Application-header">
                            Carpet Store
                        </header>

                        <div className="Application-body">
                            <Suspense fallback={<div>U??itava se...</div>}>
                                <Switch>
                                    <Route exact path="/" component={HomePage} />
                                    <Route path="/contact">
                                        <ContactPage
                                            title="BeBox"
                                            phone="+381 230/34-434"
                                            address="Svetosavska 23, Kikinda"
                                        />
                                    </Route>
                                    <Route path="/category/:cid?" component={CategoryPage} />
                                    <Route path="/article/:aid" component={ArticlePage} />
                                    
                                    <Route path="/user/login" component={UserLogin} />
                                    <Route path="/user/logout" component={UserLogout} />
                                    <Route path="/user/register" component={UserRegistration} />
                                    
                                    <Route exact path="/cart" component={CartPage} />

                                    <Route path="/administrator/login" component={AdministratorLogin} />
                                    <Route path="/administrator/logout" component={AdministratorLogout} />

                                    <Route exact path="/dashboard/category" component={CategoryDashboardList} />
                                    <Route exact path="/dashboard/category/add" component={CategoryDashboardAdd} />
                                    <Route path="/dashboard/category/edit/:cid" component={CategoryDashboardEdit} />
                                    <Route exact path="/dashboard/category/feature/:cid/list" component={FeatureDashboardList} />
                                    
                                </Switch>
                            </Suspense>
                        </div>
                    </div>
                </Container>
            </BrowserRouter>
        );
    }
}