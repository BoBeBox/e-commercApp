import { Container, ButtonGroup, Button } from "react-bootstrap"

export default function Application(){
    return(
        <Container fluid>
            <div className="Application">
                <header className="Application-header">
                    Front-end<br />
                    <ButtonGroup size ="lg">
                        <Button variant = "primary">Register</Button>
                        <Button variant = "secondary">Log in</Button>
                    </ButtonGroup>
                </header>
            </div>
        </Container>
    )
}