import { Nav } from "react-bootstrap"
import { Link } from "react-router-dom";

class TopMenuProperties{
    authorizedRole: "user"|"administrator"|"visitor" = "visitor";
}

export default function TopMenu(props: TopMenuProperties) {
    return (
        <Nav className="justify-content-center" activeKey="/">
            <Nav.Item>
                <Link className="nav-link" to="/">
                    Početna
                </Link>
            </Nav.Item>
            <Nav.Item>
                <Link className="nav-link" to="/category">
                    Kategorije
                </Link>
            </Nav.Item>

            <Nav.Item>
                <Link className="nav-link" to="/contact">
                    Kontakt
                </Link>
            </Nav.Item>
            {
                props.authorizedRole === "user"
                ? (
                    <Nav.Item>
                        <Link className="nav-link" to="/profile">
                            Moj nalog
                        </Link>
                    </Nav.Item>
                ) : ""
            }
            {
                props.authorizedRole === "visitor"
                ? (
                <Nav.Item>
                    <Link className="nav-link" to="/user/login">
                        Prijava
                    </Link>
                </Nav.Item>
                ) : ""
            }
            {
                props.authorizedRole === "user"
                ? (
                    <Nav.Item>
                        <Link className="nav-link" to="/user/logout">
                            Odjava
                        </Link>
                    </Nav.Item>
                ) : ""
            }
            {
                props.authorizedRole === "administrator"
                ? (
                    <Nav.Item>
                        <Link className="nav-link" to="/administrator/logout">
                            Odjava
                        </Link>
                    </Nav.Item>
                ) : ""
            }
        </Nav>
    );
}