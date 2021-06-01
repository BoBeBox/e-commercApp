import { Suspense } from "react";
import { Container, } from "react-bootstrap";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import TopMenu from "../TopMenu/TopMenu";
import ContactPage from "../ContactPage/ContactPage";
import HomePage from "../HomePage/HomePage";

export default function Application(){
    return (
        <BrowserRouter>
            <Container fluid>
                <TopMenu />

                <div className="Application">
                    <header className="Application-header">
                        Electronic Equipment Shop
                    </header>

                    <div className="Application-body">
                        <Suspense fallback={<div>Učitava se...</div>}>
                            <Switch>
                                <Route exact path="/" component={HomePage} />
                                <Route path="/contact">
                                    <ContactPage
                                        title="BeBox"
                                        phone="+381 230/34-434"
                                        address="Svetosavska 23, Kikinda"
                                    />
                                </Route>
                            </Switch>
                        </Suspense>
                    </div>
                </div>
            </Container>
        </BrowserRouter>
    );
}