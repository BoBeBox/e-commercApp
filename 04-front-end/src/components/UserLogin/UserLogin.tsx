import api, { saveRefreshToken, saveToken } from '../../api/api';
import EventRegister from '../../api/EventRegister';
import BasePage from '../BasePage/BasePage';
import { PageProperties } from '../BasePage/BasePage';
import { Redirect } from "react-router";
import { Row, Col, Card, Form, Button } from 'react-bootstrap';

class UserLoginState {
    isLoggedIn: boolean = false;
    email: string;
    password: string;
    message: string;
}

export default class UserLogin extends BasePage<PageProperties> {
    state: UserLoginState;

    public constructor(props: PageProperties) {
        super(props);

        this.state = {
            isLoggedIn: false,
            email: "",
            password: "",
            message: "",
        };
    }

    private checkIfUserLoggedIn() {
        api("get", "/auth/user/ok", "user")
        .then(res => {
            if (res?.data === "OK") {
                this.setState({
                    isLoggedIn: true,
                    message: "",
                });

                EventRegister.emit("AUTH_EVENT", "user.login");
            } else {
                this.setState({ isLoggedIn: false, });
            }
        })
        .catch(() => {
            this.setState({ isLoggedIn: false, });
        });
    }
    componentDidMount() {
        this.checkIfUserLoggedIn();
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
                                <Card.Title><b>User Login</b></Card.Title>
                                <Card.Text as="div">
                                    <Form.Group>
                                        <Form.Label>E-mail</Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="Enter your e-mail"
                                            value={ this.state.email }
                                            onChange={ this.onChange("email") }
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
    onChange(field: "email" | "password"): (event: React.ChangeEvent<HTMLInputElement>) => void {
        return (event: React.ChangeEvent<HTMLInputElement>) => {
            this.setState({
                [field]: event.target.value,
            });
        };
    }
    attemptLogin() {
        api(
            "post",
            "/auth/user/login",
            "user",
            {
                email: this.state.email,
                password: this.state.password,
            }
        )
        .then(res => {
            if (res?.status !== "ok") {
                return this.setState({
                    message: "Cannot log in. Possibly due to bad username or password."
                });
            }

            saveToken("user", res?.data?.authToken);
            saveRefreshToken("user", res?.data?.authToken);

            this.checkIfUserLoggedIn();
        })
        .catch(() => {
            this.setState({
                message: "Cannot log in. Possibly due to bad username or password."
            });
        });
    }
}