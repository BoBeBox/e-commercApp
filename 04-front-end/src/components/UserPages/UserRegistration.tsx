import BasePage from '../BasePage/BasePage';
import { PageProperties } from '../BasePage/BasePage';
import { Container, Col, Card, Button, Row, Form, Alert } from 'react-bootstrap';
import {Link} from 'react-router-dom';
import api from '../../api/api';
interface UserRegistrationState {
    email: string;
    password: string;
    forename: string;
    surname: string;
    phone: string;
    address: string;
    message?: string;
    isRegistrationComplete: boolean;
}

export default class UserRegistration extends BasePage<PageProperties> {
    state: UserRegistrationState;
    constructor(props: Readonly<{}>) {
        super(props);
        this.state = {
            isRegistrationComplete: false,
            email: '',
            password: '',
            forename: '',
            surname: '',
            phone: '',
            address: '',
        };
    }
    onChange(field: "email" | "password" | "forename" | "surname" | "phone" | "address"): (event: React.ChangeEvent<HTMLInputElement>) => void {
        return (event: React.ChangeEvent<HTMLInputElement>) => {
            this.setState({
                [field]: event.target.value,
            });
        };
    }
    renderMain(): JSX.Element{
        return(
            <Container>
                <Col md={{ span: 8, offset: 2 }}>
                    <Card>
                        <Card.Body>
                            <Card.Title>
                                <b>User Registration</b>
                            </Card.Title>
                            {
                                (this.state.isRegistrationComplete === false) ?
                                this.renderForm() :
                                this.renderRegistrationCompleteMessage()
                            }
                        </Card.Body>
                    </Card>
                </Col>
            </Container>
        );
    }
    private renderForm(){
        return(
            <>
                <Form>
                    <Row>
                        <Col md="6">
                            <Form.Group>
                                <Form.Label htmlFor="email">E-mail:</Form.Label>
                                <Form.Control type="email" id="email"
                                            value={ this.state.email }
                                            onChange={ this.onChange("email") } />
                            </Form.Group>
                        </Col>

                        <Col md="6">
                            <Form.Group>
                                <Form.Label htmlFor="password">Password:</Form.Label>
                                <Form.Control type="password" id="password"
                                                value={ this.state.password }
                                                onChange={ this.onChange("password") } />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md="6">
                            <Form.Group>
                                <Form.Label htmlFor="forename">Forename:</Form.Label>
                                <Form.Control type="text" id="forename"
                                            value={ this.state.forename }
                                            onChange={ this.onChange("forename") } />
                            </Form.Group>
                        </Col>

                        <Col md="6">
                            <Form.Group>
                                <Form.Label htmlFor="surname">Surname:</Form.Label>
                                <Form.Control type="text" id="surname"
                                            value={ this.state.surname }
                                            onChange={ this.onChange("surname") } />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group>
                        <Form.Label htmlFor="phone">Phone number:</Form.Label>
                        <Form.Control type="phone" id="phone"
                                      value={ this.state.phone }
                                      onChange={ this.onChange("phone") } />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label htmlFor="address">Address:</Form.Label>
                        <Form.Control id="address"
                                      as="textarea" rows={ 4 }
                                      value={ this.state.address }
                                      onChange={ this.onChange("address") } />
                    </Form.Group>

                    <Form.Group>
                        <Button variant="primary" className="mt-3"
                                onClick={ () => this.doRegister() }>
                                Register
                        </Button>
                    </Form.Group>
                </Form>
                <Alert variant="danger"
                        className={ this.state.message ? 'mt-3' : 'd-none' }>
                    { this.state.message }
                </Alert>
            </>
        )
    }
    private renderRegistrationCompleteMessage() {
        return (
            <p>
                The account has been registered.<br />
                <Link to="/user/login">Click here</Link> to to go to the login page.
            </p>
        );
    }
    private doRegister() {
        api("post", "/user/register", "user", {
            email: this.state.email,
            password: this.state.password,
            forename: this.state.forename,
            surname: this.state.surname,
            phoneNumber: this.state.phone,
            postalAddress: this.state.address,
        })
        .then(res => {
            if (res?.status === 'error') {
                return this.setState({
                    message: res?.data?.response?.data?.message ?? "Could not create a new account."
                });
            }
            this.setState({
                isRegistrationComplete: true,
            });
        });
    }
}