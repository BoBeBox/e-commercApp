import api, { saveRefreshToken, saveToken } from '../../api/api';
import EventRegister from '../../api/EventRegister';
import BasePage from '../BasePage/BasePage';
import { PageProperties } from '../BasePage/BasePage';
import { Redirect } from "react-router";
import { Row, Col, Card, Form, Button } from 'react-bootstrap';

class AdministratorLoginState {
    isLoggedIn: boolean = false;
    username: string;
    password: string;
    message: string;
}

export default class AdministratorLogin extends BasePage<PageProperties> {
    state: AdministratorLoginState;

    public constructor(props: PageProperties) {
        super(props);

        this.state = {
            isLoggedIn: false,
            username: "",
            password: "",
            message: "",
        };
    }

    private checkIfAdministratorLoggedIn() {
        api("get", "/auth/administrator/ok", "administrator")
        .then(res => {
            if (res?.data === "OK") {
                this.setState({
                    isLoggedIn: true,
                    message: "",
                });

                EventRegister.emit("AUTH_EVENT", "administrator.login");
            } else {
                this.setState({ isLoggedIn: false, });
            }
        })
        .catch(() => {
            this.setState({ isLoggedIn: false, });
        });
    }
    componentDidMount() {
        this.checkIfAdministratorLoggedIn();
    }
    renderMain(): JSX.Element {
        if (this.state.isLoggedIn) {
            return (
                <Redirect to="/profile" />
            );
        }

        return (
            <div className="pageHolder">
                <Row>
                    <Col xs={12} md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
                        <Card>
                            <Card.Body>
                                <Card.Title><b>Administrator Login</b></Card.Title>
                                <Card.Text as="div">
                                    <Form.Group>
                                        <Form.Label>E-mail</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter your e-mail"
                                            value={ this.state.username }
                                            onChange={ this.onChange("username") }
                                        />
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="Enter your password"
                                            value={ this.state.password }
                                            onChange={ this.onChange("password") }
                                        />
                                    </Form.Group>

                                    <Form.Group>
                                        <Button
                                            variant="primary"
                                            className="mt-3"
                                            onClick={ () => this.attemptLogin() }>
                                            Log In
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
    onChange(field: "username" | "password"): (event: React.ChangeEvent<HTMLInputElement>) => void {
        return (event: React.ChangeEvent<HTMLInputElement>) => {
            this.setState({
                [field]: event.target.value,
            });
        };
    }
    attemptLogin() {
        api(
            "post",
            "/auth/administrator/login",
            "administrator",
            {
                username: this.state.username,
                password: this.state.password,
            }
        )
        .then(res => {
            if (res?.status !== "ok") {
                return this.setState({
                    message: "Cannot log in. Possibly due to bad administrator or password."
                });
            }

            saveToken("administrator", res?.data?.authToken);
            saveRefreshToken("administrator", res?.data?.authToken);

            this.checkIfAdministratorLoggedIn();
        })
        .catch(() => {
            this.setState({
                message: "Cannot log in. Possibly due to bad administrator or password."
            });
        });
    }
}