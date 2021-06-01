import { Nav } from "react-bootstrap"
import { Link } from "react-router-dom";


export default function TopMenu() {
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
            <Nav.Item>
                <Link className="nav-link" to="/profile">
                    Moj nalog
                </Link>
            </Nav.Item>
            
        </Nav>
    );
}