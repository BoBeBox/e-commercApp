import { Nav } from "react-bootstrap"
import { Link } from "react-router-dom";
import React from 'react';

class TopMenuProperties{
    authorizedRole: "user"|"administrator"|"visitor" = "visitor";
}

export default class TopMenu extends React.Component<TopMenuProperties> {
    render(){
        if (this.props.authorizedRole === "visitor") {
            return (
                <Nav className="justify-content-center">
                    <Nav.Item>
                        <Link className="nav-link" to="/">Home</Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Link className="nav-link" to="/contact">Contacts</Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Link className="nav-link" to="/user/login">User login</Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Link className="nav-link" to="/user/register">User Register</Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Link className="nav-link" to="/administrator/login">Admin login</Link>
                    </Nav.Item>
                </Nav>
            )
        }
        if (this.props.authorizedRole === "administrator") {
            return (
                <Nav className="justify-content-center">
                    <Nav.Item>
                        <Link className="nav-link" to="/dashboard">Dashboard</Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Link className="nav-link" to="/dashboard/category">Categories</Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Link className="nav-link" to="/dashboard/article">Articles</Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Link className="nav-link" to="/dashboard/user">Users</Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Link className="nav-link" to="/dashboard/order">Orders</Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Link className="nav-link" to="/dashboard/administrator">Admins</Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Link className="nav-link" to="/administrator/logout">Logout</Link>
                    </Nav.Item>
                </Nav>
            );
        }
        if (this.props.authorizedRole === "user") {
            return (
                <Nav className="justify-content-center">
                    <Nav.Item>
                        <Link className="nav-link" to="/">Home</Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Link className="nav-link" to="/category">Categories</Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Link className="nav-link" to="/contact">Contact</Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Link className="nav-link" to="/profile">Profile</Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Link className="nav-link" to="/user/logout">Logout</Link>
                    </Nav.Item>

                </Nav>
            );
        }
    }
}